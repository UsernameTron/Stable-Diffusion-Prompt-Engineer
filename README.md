# Stable Diffusion Prompt Assistant

A comprehensive tool for optimizing prompts across Stable Diffusion models including SDXL, SD 1.5, and SD 2.1.

## Features

1. **Model-Specific Prompt Generation**
   - Tailored prompt structures for SDXL, SD 1.5, and SD 2.1
   - Optimized token usage within 75-token limits
   - Word weighting implementation (parentheses, positioning)
   - Model-specific modifier recommendations

2. **Advanced Parameter Optimization**
   - CFG scale guidance (5-7 for creative freedom, 7-9 for balance, 9-12 for precision)
   - Sampler selection engine (DDIM for speed, Euler a for balance, DPM++ for quality)
   - Steps configuration (20-25 for drafts, 30-40 for standard, 40-60 for detail)
   - Strength parameter guidance for img2img (0.2-0.4 subtle, 0.5-0.7 balanced, 0.7-0.9 major)

3. **Comprehensive Modifier Library**
   - Photography terms (shot types, styles, lighting, equipment)
   - Art medium specifications (painting styles, digital techniques)
   - Artist reference database with style characteristics
   - Emotional, aesthetic, and technical quality enhancers

4. **Specialized Content Templates**
   - Portrait/character template structure
   - Landscape/environment framework
   - Concept art composition guide
   - Anime/stylized content optimization

5. **Negative Prompt Generator**
   - Model-specific negative prompts (SDXL vs SD 1.5)
   - Use-case templates (portrait, landscape, anime, photorealistic)
   - Technical quality improvements
   - Anatomical correction terms

6. **Result Analysis Tools**
   - Image quality assessment
   - Subject-specific issue recognition (portraits, landscapes, characters)
   - Common problem identification and solutions
   - Next-step recommendations

7. **ControlNet Integration Guide**
   - Open Pose implementation
   - Kenny Mode (edge detection)
   - Depth Mode guidance
   - Line Art and IP Adapter techniques

## Deployment

This project is designed for deployment on Netlify as a static site.

### Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. For a local server: `npx serve`

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: none (purely static site)
   - Publish directory: `/`
3. Deploy!

## Technology

- Plain HTML, CSS, and JavaScript
- No external dependencies
- Fully client-side processing

## Usage

1. Select a model (SDXL, SD 1.5, SD 2.1)
2. Choose a content type (portrait, landscape, concept art, anime)
3. Customize your prompt elements
4. Generate and copy the optimized prompt
5. Use the recommended parameters for your chosen model