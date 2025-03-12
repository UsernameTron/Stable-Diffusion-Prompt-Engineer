# CLAUDE.md - Stable Diffusion Prompt Assistant

## Commands
- Run application: `node "enhanced-sd-prompt-assistant (1).js"`
- Run web interface: `node "enhanced-sd-prompt-assistant (1).js" --web`
- The web interface requires Express.js installed

## Code Style Guidelines
- JavaScript with functional programming approach
- 4-space indentation, semicolons, single quotes
- camelCase for variables/functions (e.g., `loadTemplate`, `setupExpressServer`)
- kebab-case for HTML IDs (e.g., `parameter-guidance`, `content-type`)
- Template literals for HTML generation
- Function parameters on new lines for readability

## Error Handling
- Try/catch blocks with console.error logging
- Process.exit(1) for fatal errors
- User-friendly alerts for UI errors

## Project Structure
- JavaScript logic in enhanced-sd-prompt-assistant.js
- Knowledge base stored in markdown files
- Separation between logic and UI components
- CommonJS modules with require statements
- Data stored in structured objects

## Development Notes
- The codebase focuses on Stable Diffusion prompt assistance
- OpenArt AI and Kling AI are key integrations
- Primary purpose is to help users create effective prompts