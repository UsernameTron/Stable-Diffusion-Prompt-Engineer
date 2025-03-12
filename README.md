# Stable Diffusion Prompt Assistant

A comprehensive tool for generating optimized prompts for various AI image and video generation models, including specialized support for OpenArt AI models and Kling AI motion prompts.

## Features

- **OpenArt AI Model Optimization**: Generate prompts optimized for specialized models:
  - Juggernaut XL (photorealistic portraits)
  - Flux (Dev) (realistic images with accurate text)
  - Juggernaut Flux Pro (superior photorealism with natural textures)
  - Flux (Pro) (professional applications)
  - SDXL Film Photography Style (film aesthetics)

- **Kling AI Motion Prompts**: Create motion-optimized prompts for video generation:
  - Natural motion detection and enhancement
  - Camera movement effects
  - Environmental motion effects (wind, water, particles)
  - Variable intensity control

- **Quick Natural Language Prompting**: Convert simple descriptions into structured prompts with:
  - Content type detection
  - Quality enhancement
  - Style application

## Getting Started

### Prerequisites

- Node.js installed on your system

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/stable-diffusion-prompt-assistant.git
   cd stable-diffusion-prompt-assistant
   ```

2. Install dependencies (if any):
   ```
   npm install
   ```

### Usage

#### Command Line Interface

Run the CLI tool:
```
node prompt-cli.js
```

This will present a menu with options for:
1. OpenArt AI Models Prompt Generation
2. Kling AI Motion Prompt Generation
3. Quick Natural Language Prompt

#### Web Interface Demo

View the model information demo:
```
open index.html
```

This will open a visual demo of the OpenArt AI model information in your default browser.

### Programmatic Usage

You can also use the prompt generator in your own JavaScript projects:

```javascript
const { 
    generateKlingMotionPrompt, 
    generateOpenArtPrompt, 
    generateNaturalLanguagePrompt 
} = require('./prompt-generator');

// Generate an OpenArt optimized prompt
const openartResult = generateOpenArtPrompt(
    "woman portrait", 
    "looking at camera, natural lighting", 
    "professional photography", 
    "juggernautxl"
);
console.log(openartResult.prompt);
console.log(openartResult.recommendations);

// Generate a Kling AI motion prompt
const klingResult = generateKlingMotionPrompt(
    "a waterfall in a forest", 
    "water", 
    "medium"
);
console.log(klingResult);

// Generate a natural language prompt
const nlResult = generateNaturalLanguagePrompt(
    "a wolf standing on a mountain at night under the moon", 
    "fantasy art"
);
console.log(nlResult);
```

## Model Parameter Optimization

The tool provides optimized parameters for each OpenArt AI model:

| Model | Recommended CFG | Recommended Sampler | Recommended Steps |
|-------|----------------|---------------------|------------------|
| Juggernaut XL | 4-6 | DPM++ 2M SDE | 30-40 |
| Flux (Dev) | 7-8 | DPM++ 2M Karras | 28-35 |
| Juggernaut Flux Pro | 4-7 | DPM++ 2M Karras | 30-40 |
| Flux (Pro) | 5-9 | DPM++ 2M Karras | 25-35 |
| SDXL Film | 7-9 | DPM++ 2M Karras | 30-40 |

## Model Information

For detailed information about each model's capabilities and optimal use cases, visit the OpenArt AI Models tab in the web interface or refer to the documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.