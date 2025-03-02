/**
 * Blockchain API Routes
 * Handles all blockchain-related API endpoints
 */

const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const { formatResponse } = require('../utils/helpers');

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    const status = {
      initialized: blockchainService.initialized,
      network: process.env.SOLANA_NETWORK || 'devnet',
      authorityPublicKey: blockchainService.authorityKeypair?.publicKey.toString() || null,
      programId: blockchainService.programId?.toString() || null,
    };
    
    res.json(formatResponse(true, status));
  } catch (error) {
    console.error('Error getting blockchain status:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to get blockchain status'));
  }
});

// List a property on the blockchain
router.post('/properties/list', async (req, res) => {
  try {
    const { ownerPublicKey, propertyData } = req.body;
    
    if (!ownerPublicKey) {
      return res.status(400).json(formatResponse(false, null, 'Owner public key is required'));
    }
    
    if (!propertyData) {
      return res.status(400).json(formatResponse(false, null, 'Property data is required'));
    }
    
    const result = await blockchainService.listProperty(ownerPublicKey, propertyData);
    res.json(formatResponse(true, result));
  } catch (error) {
    console.error('Error listing property on blockchain:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to list property on blockchain'));
  }
});

// Book a property on the blockchain
router.post('/properties/:propertyId/book', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { tenantPublicKey, durationDays } = req.body;
    
    if (!tenantPublicKey) {
      return res.status(400).json(formatResponse(false, null, 'Tenant public key is required'));
    }
    
    if (!durationDays) {
      return res.status(400).json(formatResponse(false, null, 'Duration days is required'));
    }
    
    const result = await blockchainService.bookProperty(tenantPublicKey, propertyId, durationDays);
    res.json(formatResponse(true, result));
  } catch (error) {
    console.error('Error booking property on blockchain:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to book property on blockchain'));
  }
});

// Generate a digital key on the blockchain
router.post('/properties/:propertyId/key', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { tenantPublicKey } = req.body;
    
    if (!tenantPublicKey) {
      return res.status(400).json(formatResponse(false, null, 'Tenant public key is required'));
    }
    
    const result = await blockchainService.generateDigitalKey(tenantPublicKey, propertyId);
    res.json(formatResponse(true, result));
  } catch (error) {
    console.error('Error generating digital key on blockchain:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to generate digital key on blockchain'));
  }
});

// Validate access on the blockchain
router.post('/access/validate', async (req, res) => {
  try {
    const { tenantPublicKey, accessToken, propertyId } = req.body;
    
    if (!tenantPublicKey || !accessToken || !propertyId) {
      return res.status(400).json(formatResponse(false, null, 'Tenant public key, access token, and property ID are required'));
    }
    
    const result = await blockchainService.validateAccess(tenantPublicKey, accessToken, propertyId);
    res.json(formatResponse(true, result));
  } catch (error) {
    console.error('Error validating access on blockchain:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to validate access on blockchain'));
  }
});

// Record a violation on the blockchain
router.post('/violations', async (req, res) => {
  try {
    const { propertyId, violationType, description } = req.body;
    
    if (!propertyId || !violationType) {
      return res.status(400).json(formatResponse(false, null, 'Property ID and violation type are required'));
    }
    
    const result = await blockchainService.recordViolation(propertyId, violationType, description || '');
    res.json(formatResponse(true, result));
  } catch (error) {
    console.error('Error recording violation on blockchain:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to record violation on blockchain'));
  }
});

// Get transaction history for a wallet
router.get('/transactions/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json(formatResponse(false, null, 'Wallet address is required'));
    }
    
    // In a real implementation, this would query the blockchain for transactions
    // For now, we'll just return a mock response
    const transactions = [
      {
        signature: 'mock_tx_signature_1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: 'booking',
        amount: 1.5,
        status: 'completed',
      },
      {
        signature: 'mock_tx_signature_2',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        type: 'payment',
        amount: 0.5,
        status: 'completed',
      },
    ];
    
    res.json(formatResponse(true, transactions));
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to get transaction history'));
  }
});

// Get property history on the blockchain
router.get('/properties/:propertyId/history', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    if (!propertyId) {
      return res.status(400).json(formatResponse(false, null, 'Property ID is required'));
    }
    
    // In a real implementation, this would query the blockchain for property history
    // For now, we'll just return a mock response
    const history = [
      {
        timestamp: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        action: 'listed',
        actor: 'owner_public_key',
        details: 'Property listed for rent',
      },
      {
        timestamp: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
        action: 'booked',
        actor: 'tenant_public_key_1',
        details: 'Property booked for 5 days',
      },
      {
        timestamp: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
        action: 'completed',
        actor: 'tenant_public_key_1',
        details: 'Rental completed',
      },
      {
        timestamp: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
        action: 'booked',
        actor: 'tenant_public_key_2',
        details: 'Property booked for 7 days',
      },
    ];
    
    res.json(formatResponse(true, history));
  } catch (error) {
    console.error('Error getting property history:', error);
    res.status(500).json(formatResponse(false, null, 'Failed to get property history'));
  }
});

module.exports = router;
