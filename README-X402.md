# Plasma Figurine Generator with X402 Payments

An AI-powered isometric figurine generator with integrated Plasma USDT0 payments using the x402 protocol.

## Features

- **Free Access for plasma.to Team**: Team members with `@plasma.to` emails get unlimited free access
- **Pay-Per-Use for External Users**: Non-team users pay exact API costs in Plasma USDT0
- **Payment Agnostic**: Support for cross-chain token swaps via LiFi protocol
- **Gasless Payments**: EIP-3009 `transferWithAuthorization` for gasless USDT0 transfers
- **Dynamic Cost Calculation**: Automatically calculates exact API costs + gas fees
- **Rate Limiting**: Multi-tier rate limiting to prevent abuse
- **Security**: Comprehensive security measures including DDoS protection and spam prevention

## Architecture

The application uses a multi-layered architecture:

1. **Authentication Layer**: Differentiates between `@plasma.to` users and external users
2. **Payment Middleware**: Implements x402 protocol for payment-gated API access
3. **Cost Calculator**: Dynamically calculates API costs based on actual usage
4. **LiFi Integration**: Enables cross-chain token swaps to USDT0
5. **Rate Limiter**: Protects endpoints from abuse

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/xkonjin/plasma-figurine-generator.git
cd plasma-figurine-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Authentication
AUTH_SECRET=your-auth-secret
RESEND_API_KEY=your-resend-api-key

# Plasma USDT0
PLASMA_RPC=https://rpc.plasma.to
PLASMA_CHAIN_ID=9745
MERCHANT_ADDRESS=0xYourMerchantWalletAddress

# Payment Configuration
FIGURINE_PRICE=0.10
USE_DYNAMIC_PRICING=true
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Payment Flow

### For plasma.to Users

1. User logs in with `@plasma.to` email
2. User generates figurines for free (no payment required)
3. Rate limit: 100 requests per hour

### For External Users

1. User attempts to generate a figurine
2. Server returns HTTP 402 Payment Required with payment options
3. User connects wallet and approves payment
4. User signs EIP-3009 authorization (gasless)
5. Server verifies signature and settles payment
6. Figurine is generated and returned
7. Rate limit: 5 requests per hour per wallet

### Payment Options

- **Direct USDT0 Payment**: Pay with USDT0 on Plasma chain
- **Cross-Chain Swap**: Pay with any supported token via LiFi (auto-converts to USDT0)

## API Endpoints

### Generate Figurine

```
POST /api/generate
```

**Headers** (for paid access):
- `Payment-Signature`: Base64-encoded payment signature

**Body**:
```json
{
  "prompt": "A developer coding at a desk",
  "style": "isometric"
}
```

**Response** (402 Payment Required):
```json
{
  "invoiceId": "uuid",
  "timestamp": 1234567890,
  "paymentOptions": [{
    "network": "plasma",
    "chainId": 9745,
    "token": "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
    "tokenSymbol": "USDT0",
    "amount": "100000",
    "decimals": 6,
    "recipient": "0xMerchantAddress",
    "scheme": "eip3009-transfer-with-auth",
    "nonce": "...",
    "deadline": 1234568490,
    "feeBreakdown": {
      "amount": "100000",
      "percentBps": 10,
      "percentFee": "10",
      "totalFee": "10"
    }
  }],
  "description": "Generate personalized figurine"
}
```

### Verify Payment

```
POST /api/payment/verify
```

**Body**:
```json
{
  "invoiceId": "uuid",
  "signature": "0x...",
  "authorization": {
    "from": "0x...",
    "to": "0x...",
    "value": "100000",
    "validAfter": 1234567890,
    "validBefore": 1234568490,
    "nonce": "0x..."
  }
}
```

### LiFi Quote

```
GET /api/lifi/quote?fromChainId=1&fromTokenAddress=0x...&fromAmount=100000
```

Returns a quote for swapping tokens to USDT0 on Plasma.

## Cost Calculation

Costs are calculated dynamically based on:

1. **Gemini API Cost**: Actual token usage + image generation cost
2. **Gas Fee Buffer**: Estimated gas cost with safety multiplier
3. **Platform Fee**: 0.1% (10 basis points)

Example breakdown:
```
Gemini API:      $0.020
Gas Fee Buffer:  $0.001
Platform Fee:    $0.000
-----------------------
Total:           $0.021 USDT0
```

## Rate Limiting

| User Type | Rate Limit |
|-----------|------------|
| Anonymous | 1 request per 5 minutes per IP |
| Authenticated (non-plasma.to) | 5 requests per hour per wallet |
| plasma.to users | 100 requests per hour |
| Payment verification | 10 attempts per payment per hour |

## Security

- **Authentication**: Magic link email authentication
- **Rate Limiting**: IP and wallet-based rate limiting
- **Payment Verification**: EIP-3009 signature verification
- **Request Validation**: Size limits and timeout enforcement
- **DDoS Protection**: Recommended: Cloudflare WAF/CDN

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
GEMINI_API_KEY=your-production-key
AUTH_SECRET=your-production-secret
RESEND_API_KEY=your-production-resend-key
MERCHANT_ADDRESS=0xYourProductionWallet
FIGURINE_PRICE=0.10
PLASMA_RPC=https://rpc.plasma.to
PLASMA_CHAIN_ID=9745
```

## Monitoring

Monitor costs and usage:

```bash
# View cost logs
npm run logs

# Monitor payment transactions
# Check your merchant wallet on Plasma explorer
```

## Troubleshooting

### Payment Verification Fails

- Check that `MERCHANT_ADDRESS` is correctly configured
- Verify the user has sufficient USDT0 balance
- Ensure the signature is valid and not expired

### Rate Limit Exceeded

- Wait for the rate limit window to reset
- For plasma.to users: check email domain verification
- For external users: consider upgrading limits

### LiFi Quote Fails

- Check that the source chain/token is supported
- Verify sufficient liquidity for the swap
- Try a different route or token

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: https://github.com/xkonjin/plasma-figurine-generator/issues
- Email: support@plasma.to

## Related Projects

- [xUSDT](https://github.com/xkonjin/xUSDT) - x402 A2A payments on Plasma
- [Plasma Chain](https://plasma.to) - Layer 1 blockchain for stablecoin payments
- [LiFi Protocol](https://li.fi) - Cross-chain bridge and DEX aggregator
