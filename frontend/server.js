const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Path to the project root (one level up from frontend)
const PROJECT_ROOT = path.join(__dirname, '..');

// Utility function to execute shell commands
function executeCommand(command, cwd = PROJECT_ROOT) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: error.message, stderr });
            } else {
                resolve({ success: true, output: stdout, stderr });
            }
        });
    });
}

// API Routes

// Generate test data
app.post('/api/generate-test-data', async (req, res) => {
    try {
        console.log('Generating test data...');
        const result = await executeCommand('node scripts/test-data.js');
        
        if (result.success) {
            const testData = JSON.parse(result.output);
            res.json({ success: true, data: testData });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error generating test data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Prover.toml with form data
app.post('/api/update-prover-toml', async (req, res) => {
    try {
        const { formData } = req.body;
        
        // Create TOML content
        let tomlContent = `merkle_root = "${formData.merkle_root}"\n`;
        tomlContent += `product_id = "${formData.product_id}"\n`;
        tomlContent += `supplier_public_key_x = "${formData.supplier_public_key_x}"\n`;
        tomlContent += `supplier_public_key_y = "${formData.supplier_public_key_y}"\n`;
        tomlContent += `signature_r8x = "${formData.signature_r8x}"\n`;
        tomlContent += `signature_r8y = "${formData.signature_r8y}"\n`;
        tomlContent += `signature_s = "${formData.signature_s}"\n`;
        tomlContent += `path_elements = [${formData.path_elements.map(e => `"${e}"`).join(', ')}]\n`;
        tomlContent += `path_indices = [${formData.path_indices.map(i => `"${i}"`).join(', ')}]\n`;
        
        // Write to Prover.toml
        const proverTomlPath = path.join(PROJECT_ROOT, 'Prover.toml');
        await fs.writeFile(proverTomlPath, tomlContent);
        
        console.log('Prover.toml updated successfully');
        res.json({ success: true, message: 'Prover.toml updated successfully' });
    } catch (error) {
        console.error('Error updating Prover.toml:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Compile circuit
app.post('/api/compile', async (req, res) => {
    try {
        console.log('Compiling circuit...');
        const result = await executeCommand('nargo compile');
        
        res.json({
            success: result.success,
            output: result.output,
            error: result.error,
            stderr: result.stderr
        });
    } catch (error) {
        console.error('Error compiling circuit:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Execute circuit (generate proof)
app.post('/api/execute', async (req, res) => {
    try {
        console.log('Executing circuit...');
        const result = await executeCommand('nargo execute');
        
        res.json({
            success: result.success,
            output: result.output,
            error: result.error,
            stderr: result.stderr
        });
    } catch (error) {
        console.error('Error executing circuit:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check circuit status
app.get('/api/status', async (req, res) => {
    try {
        console.log('Checking circuit status...');
        const checkResult = await executeCommand('nargo check');
        const infoResult = await executeCommand('nargo info');
        
        // Check if proof file exists
        const proofPath = path.join(PROJECT_ROOT, 'target', 'zk_provenance.gz');
        let proofExists = false;
        let proofStats = null;
        
        try {
            proofStats = await fs.stat(proofPath);
            proofExists = true;
        } catch (e) {
            // Proof file doesn't exist
        }
        
        res.json({
            success: true,
            circuit: {
                status: checkResult.success ? 'ready' : 'error',
                output: checkResult.output,
                error: checkResult.error
            },
            info: {
                output: infoResult.output,
                error: infoResult.error
            },
            proof: {
                exists: proofExists,
                lastModified: proofExists ? proofStats.mtime : null
            }
        });
    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get project info
app.get('/api/info', async (req, res) => {
    try {
        const result = await executeCommand('nargo info');
        res.json({
            success: result.success,
            output: result.output,
            error: result.error
        });
    } catch (error) {
        console.error('Error getting project info:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ZK Provenance Frontend Server running at http://localhost:${PORT}`);
    console.log(`📁 Project root: ${PROJECT_ROOT}`);
    console.log('\n🔗 Available endpoints:');
    console.log('  GET  /                     - Frontend interface');
    console.log('  POST /api/generate-test-data - Generate test data');
    console.log('  POST /api/update-prover-toml - Update Prover.toml');
    console.log('  POST /api/compile          - Compile circuit');
    console.log('  POST /api/execute          - Execute circuit');
    console.log('  GET  /api/status           - Check system status');
    console.log('  GET  /api/info             - Get project info');
});

module.exports = app;