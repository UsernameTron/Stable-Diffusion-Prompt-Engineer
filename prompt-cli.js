/**
 * Command Line Interface for Stable Diffusion Prompt Generator
 * A simple CLI tool for generating optimized prompts for different models
 */

const readline = require('readline');
const { 
    generateKlingMotionPrompt, 
    generateOpenArtPrompt, 
    generateNaturalLanguagePrompt 
} = require('./prompt-generator');

// Set up readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Welcome message
console.log(`
╔══════════════════════════════════════════════════════════════╗
║        Stable Diffusion Prompt Assistant Command Line        ║
╚══════════════════════════════════════════════════════════════╝

Choose a prompt generation mode:
1. OpenArt AI Models Prompt Generation
2. Kling AI Motion Prompt Generation
3. Quick Natural Language Prompt
4. Exit
`);

// Main menu handler
function showMainMenu() {
    rl.question('Enter your choice (1-4): ', (answer) => {
        const option = parseInt(answer.trim());
        
        switch(option) {
            case 1:
                generateOpenArtModelPrompt();
                break;
            case 2:
                generateKlingMotionPrompt();
                break;
            case 3:
                generateQuickPrompt();
                break;
            case 4:
                console.log('Thank you for using the Stable Diffusion Prompt Assistant!');
                rl.close();
                break;
            default:
                console.log('Invalid option. Please try again.');
                showMainMenu();
        }
    });
}

// OpenArt AI model prompt generator
function generateOpenArtModelPrompt() {
    console.log(`\n=== OpenArt AI Model Prompt Generator ===\n`);
    
    // List available models
    console.log('Available OpenArt models:');
    console.log('1. Juggernaut XL (photorealistic portraits)');
    console.log('2. Flux (Dev) (realistic images with text)');
    console.log('3. Juggernaut Flux Pro (photorealistic with natural textures)');
    console.log('4. Flux (Pro) (professional applications)');
    console.log('5. SDXL Film Photography Style (film aesthetics)\n');
    
    // Prompt for model selection
    rl.question('Select model (1-5): ', (modelChoice) => {
        const modelMap = {
            '1': 'juggernautxl',
            '2': 'fluxdev',
            '3': 'juggernautfluxpro',
            '4': 'fluxpro',
            '5': 'sdxlfilm'
        };
        
        const model = modelMap[modelChoice] || 'juggernautxl';
        
        // Get subject
        rl.question('\nMain subject: ', (subject) => {
            // Get details
            rl.question('Additional details (optional): ', (details) => {
                // Get style
                rl.question('Art style (optional): ', (style) => {
                    // Generate the prompt
                    const result = generateOpenArtPrompt(subject, details, style, model);
                    
                    // Display the generated prompt
                    console.log('\n=== Generated Prompt ===');
                    console.log(result.prompt);
                    
                    // Display recommendations
                    console.log('\n=== Recommended Settings ===');
                    console.log(`CFG Scale: ${result.recommendations.cfg}`);
                    console.log(`Sampler: ${result.recommendations.sampler}`);
                    console.log(`Steps: ${result.recommendations.steps}`);
                    
                    // Return to main menu
                    console.log('\nPress Enter to return to the main menu...');
                    rl.question('', () => {
                        showMainMenu();
                    });
                });
            });
        });
    });
}

// Kling AI motion prompt generator
function generateKlingMotionPrompt() {
    console.log(`\n=== Kling AI Motion Prompt Generator ===\n`);
    
    // List available motion types
    console.log('Available motion types:');
    console.log('1. Natural (detect and enhance motion in prompt)');
    console.log('2. Camera (camera movement effects)');
    console.log('3. Wind (wind-based motion effects)');
    console.log('4. Water (water and liquid motion)');
    console.log('5. Particles (floating particles effects)\n');
    
    // Prompt for motion type
    rl.question('Select motion type (1-5): ', (motionChoice) => {
        const motionMap = {
            '1': 'natural',
            '2': 'camera',
            '3': 'wind',
            '4': 'water',
            '5': 'particles'
        };
        
        const motionType = motionMap[motionChoice] || 'natural';
        
        // List intensity options
        console.log('\nMotion intensity:');
        console.log('1. Low (subtle, gentle motion)');
        console.log('2. Medium (moderate, balanced motion)');
        console.log('3. High (dramatic, intense motion)\n');
        
        // Prompt for intensity
        rl.question('Select intensity (1-3): ', (intensityChoice) => {
            const intensityMap = {
                '1': 'low',
                '2': 'medium',
                '3': 'high'
            };
            
            const intensity = intensityMap[intensityChoice] || 'medium';
            
            // Get base prompt
            rl.question('\nEnter your base image prompt: ', (basePrompt) => {
                // Generate the motion prompt
                const result = require('./prompt-generator').generateKlingMotionPrompt(basePrompt, motionType, intensity);
                
                // Display the generated prompt
                console.log('\n=== Generated Motion Prompt ===');
                console.log(result);
                
                // Return to main menu
                console.log('\nPress Enter to return to the main menu...');
                rl.question('', () => {
                    showMainMenu();
                });
            });
        });
    });
}

// Quick natural language prompt generator
function generateQuickPrompt() {
    console.log(`\n=== Quick Natural Language Prompt Generator ===\n`);
    
    // Get description
    rl.question('Enter a natural language description: ', (description) => {
        // List style options
        console.log('\nChoose a style (optional):');
        console.log('1. None');
        console.log('2. Photorealistic');
        console.log('3. Digital Art');
        console.log('4. Oil Painting');
        console.log('5. Watercolor');
        console.log('6. Anime Style');
        console.log('7. Cinematic');
        console.log('8. Fantasy');
        
        // Get style preference
        rl.question('\nSelect style (1-8): ', (styleChoice) => {
            const styleMap = {
                '1': 'none',
                '2': 'photorealistic, hyperrealistic',
                '3': 'digital art, trending on artstation',
                '4': 'oil painting, detailed brushwork',
                '5': 'watercolor, soft colors, flowing pigment',
                '6': 'anime style, detailed illustration',
                '7': 'cinematic lighting, movie scene, film still',
                '8': 'fantasy art, magical, ethereal'
            };
            
            const style = styleMap[styleChoice] || 'none';
            
            // Generate the prompt
            const result = generateNaturalLanguagePrompt(description, style === 'none' ? '' : style);
            
            // Display the generated prompt
            console.log('\n=== Generated Prompt ===');
            console.log(result);
            
            // Return to main menu
            console.log('\nPress Enter to return to the main menu...');
            rl.question('', () => {
                showMainMenu();
            });
        });
    });
}

// Start the application
showMainMenu();