# AWS Bedrock Log Analyzer

A small TypeScript API that sends an application log to Amazon Bedrock and returns a concise root-cause analysis with practical remediation steps.

It is intentionally a focused learning project: one endpoint, no database, no stored credentials, and no AWS infrastructure to deploy before you can run it locally.

## What you need

- Node.js 20 or newer
- An AWS account and credentials that can invoke a Bedrock model
- Model access enabled for the model you choose in the AWS region you use

The included default model is `amazon.nova-lite-v1:0` in `us-east-1`. Change either value in `.env` if required by your AWS account.

## Set up

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local configuration:

   ```bash
   cp .env.example .env
   ```

3. Configure AWS credentials using **one** of these standard AWS SDK methods:

   - Run `aws configure` to create a local AWS profile (recommended for local development).
   - Export `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` in your shell.
   - Run the app on AWS with an IAM role attached.

   Do not add credentials to `.env` or commit them to Git.

4. Update `.env` if you want another AWS region or Bedrock model.

5. Start the API:

   ```bash
   npm run dev
   ```

The service listens on `http://localhost:3000` by default.

## Use the API

Check that it is running:

```bash
curl http://localhost:3000/health
```

Analyze a plain-text log file:

```bash
curl -X POST http://localhost:3000/api/analyze-log \
  -F "file=@examples/sample-error.log"
```

The response is JSON:

```json
{
  "analysis": "..."
}
```

The endpoint accepts a `file` form field containing a UTF-8 text log. The default maximum upload size is 1 MB; adjust `MAX_LOG_SIZE_BYTES` in `.env` when necessary.

## AWS permissions

The principal used by the app needs permission to invoke the selected model, for example:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["bedrock:InvokeModel"],
    "Resource": "*"
  }]
}
```

Use a more restrictive resource policy in production where your chosen model and region support it.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run locally with automatic TypeScript execution |
| `npm run build` | Type-check and compile to `dist/` |
| `npm start` | Run the compiled service |
| `npm run check` | Type-check without writing output |

## Project layout

```text
src/
  app.ts             Express routes and HTTP handling
  server.ts          Configuration and server startup
  services/          Bedrock request logic
examples/            A safe sample log for trying the API
```

## Troubleshooting

- **AccessDeniedException**: confirm model access is enabled in the selected region and your AWS identity has `bedrock:InvokeModel` permission.
- **ResourceNotFoundException**: verify `BEDROCK_MODEL_ID` and `AWS_REGION` match a model available to your account.
- **Credential errors**: run `aws sts get-caller-identity` in the same terminal to verify your AWS setup.

