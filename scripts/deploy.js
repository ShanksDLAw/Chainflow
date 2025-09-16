// Hackathon submission update
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting ChainFlow deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");
  
  // Deploy ChainFlowVerifier contract
  console.log("\nDeploying ChainFlowVerifier...");
  const ChainFlowVerifier = await ethers.getContractFactory("ChainFlowVerifier");
  const chainFlowVerifier = await ChainFlowVerifier.deploy();
  
  await chainFlowVerifier.deployed();
  console.log("ChainFlowVerifier deployed to:", chainFlowVerifier.address);
  
  // Test the contract
  console.log("\nTesting contract functionality...");
  const testInput = [1, 85, 92, 15]; // [isValid, trustScore, routeEfficiency, riskLevel]
  
  try {
    const tx = await chainFlowVerifier.verifyProof(testInput);
    const receipt = await tx.wait();
    console.log("Test verification successful! Transaction hash:", receipt.transactionHash);
    
    // Test the detailed verification function
    const result = await chainFlowVerifier.verifyAndGetResults(testInput);
    console.log("Detailed verification result:", {
      isValid: result.isValid,
      trustScore: result.trustScore.toString(),
      routeEfficiency: result.routeEfficiency.toString(),
      riskLevel: result.riskLevel.toString()
    });
  } catch (error) {
    console.error("Contract test failed:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainFlowVerifier: {
      address: chainFlowVerifier.address,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber()
    }
  };
  
  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file for frontend integration
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '../frontend/deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to:", deploymentPath);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update frontend with contract address:", chainFlowVerifier.address);
  console.log("2. Verify contract on block explorer if needed");
  console.log("3. Test marketplace functionality with real transactions");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });