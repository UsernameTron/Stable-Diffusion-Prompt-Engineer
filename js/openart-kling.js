/**
 * OpenArt AI and Kling AI Prompt Generation
 * Handles specialized prompt generation for OpenArt AI models and Kling AI motion prompts
 */

document.addEventListener('DOMContentLoaded', () => {
    // OpenArt AI model enhancers
    const modelEnhancers = {
        juggernautxl: {
            portraitEnhancers: [
                "photorealistic portrait", "lifelike skin texture", "detailed facial features", 
                "subtle skin details", "natural lighting", "expressive portrait", "realistic eyes"
            ],
            recommendedCFG: "4-6",
            recommendedSampler: "DPM++ 2M SDE",
            recommendedSteps: "30-40"
        },
        fluxdev: {
            textEnhancers: [
                "clear text", "legible typography", "readable labels", "integrated text",
                "detailed typography", "accurate text positioning"
            ],
            recommendedCFG: "7-8",
            recommendedSampler: "DPM++ 2M Karras",
            recommendedSteps: "28-35"
        },
        juggernautfluxpro: {
            textureEnhancers: [
                "natural skin texture", "detailed material surfaces", "photorealistic texture",
                "fabric detail", "surface reflection", "material definition", "organic texture"
            ],
            recommendedCFG: "4-7",
            recommendedSampler: "DPM++ 2M Karras",
            recommendedSteps: "30-40"
        },
        fluxpro: {
            professionalEnhancers: [
                "professional quality", "commercial grade", "detailed composition",
                "balanced lighting", "polished finish", "premium look", "studio quality"
            ],
            recommendedCFG: "5-9",
            recommendedSampler: "DPM++ 2M Karras",
            recommendedSteps: "25-35"
        },
        sdxlfilm: {
            filmEnhancers: [
                "film photography style", "authentic film grain", "light grain", "medium grain", 
                "heavy grain", "analog film look", "film color grading", "35mm film", "medium format film"
            ],
            recommendedCFG: "7-9",
            recommendedSampler: "DPM++ 2M Karras",
            recommendedSteps: "30-40"
        }
    };
    
    // Motion patterns for Kling AI
    const motionPatterns = {
        simple: ["moving", "walking", "running", "flying", "flowing", "spinning", "rotating", "turning",
            "swinging", "dancing", "jumping", "falling", "rising", "zooming", "panning", "tracking"],
        camera: ["camera panning left to right", "camera zooming in", "camera zooming out", 
            "camera tracking forward", "camera tracking backward", "camera following subject"],
        environmental: ["windy", "breezy", "waves", "ripples", "floating particles", "flowing water"]
    };
    
    // Motion intensity modifiers
    const intensityModifiers = {
        low: ["slowly", "gently", "subtly", "slightly"],
        medium: ["smoothly", "steadily", "moderately"],
        high: ["quickly", "rapidly", "dramatically", "vigorously"]
    };
    
    /**
     * Generate a prompt optimized for OpenArt AI models
     */
    function generateOpenArtPrompt(subject, details, style, model) {
        // Clean inputs
        const cleanedSubject = subject.trim();
        const cleanedDetails = details.trim();
        const cleanedStyle = style.trim();
        
        // Base prompt structure
        let promptParts = [cleanedSubject];
        
        // Add details if provided
        if (cleanedDetails) {
            promptParts.push(cleanedDetails);
        }
        
        // Add style if provided
        if (cleanedStyle) {
            promptParts.push(cleanedStyle);
        }
        
        // Add model-specific enhancers
        if (modelEnhancers[model]) {
            // Determine which enhancer category to use
            const enhancerCategory = 
                model === 'juggernautxl' ? 'portraitEnhancers' :
                model === 'fluxdev' ? 'textEnhancers' :
                model === 'juggernautfluxpro' ? 'textureEnhancers' :
                model === 'fluxpro' ? 'professionalEnhancers' :
                model === 'sdxlfilm' ? 'filmEnhancers' : 'portraitEnhancers';
            
            // Add 1-2 model-specific enhancers
            const enhancers = modelEnhancers[model][enhancerCategory];
            const selectedEnhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
            promptParts.push(selectedEnhancer);
            
            // Add quality enhancers for most models
            if (model !== 'sdxlfilm') {  // Film style doesn't need these
                promptParts.push("high quality, detailed");
            }
        }
        
        // Format the final prompt
        const finalPrompt = promptParts.join(", ");
        
        // Return prompt and recommendations
        return {
            prompt: finalPrompt,
            recommendations: {
                cfg: modelEnhancers[model].recommendedCFG,
                sampler: modelEnhancers[model].recommendedSampler,
                steps: modelEnhancers[model].recommendedSteps
            }
        };
    }
    
    /**
     * Generate a motion prompt for Kling AI
     */
    function generateKlingMotionPrompt(basePrompt, motionType, intensity) {
        // Clean input
        const cleanedPrompt = basePrompt.trim().replace(/\.$/, '');
        
        // Select intensity modifier
        const intensityMods = intensityModifiers[intensity] || intensityModifiers.medium;
        const intensityMod = intensityMods[Math.floor(Math.random() * intensityMods.length)];
        
        // Select motion pattern based on type
        const motionOptions = motionPatterns[motionType] || motionPatterns.simple;
        const selectedMotion = motionOptions[Math.floor(Math.random() * motionOptions.length)];
        
        // Build motion prompt
        return `${cleanedPrompt}, ${intensityMod} ${selectedMotion}`;
    }
    
    // Event listener for OpenArt prompt generation
    document.getElementById('generate-openart-prompt')?.addEventListener('click', () => {
        const subject = document.getElementById('openart-subject').value;
        const details = document.getElementById('openart-details').value;
        const style = document.getElementById('openart-style').value;
        
        // Get selected model
        const modelButton = document.querySelector('#openart-generator .model-selector .active');
        const model = modelButton.getAttribute('data-model');
        
        // Basic validation
        if (!subject) {
            alert('Please enter a subject');
            return;
        }
        
        // Generate the prompt
        const result = generateOpenArtPrompt(subject, details, style, model);
        
        // Display the prompt
        document.getElementById('openart-generated-prompt').textContent = result.prompt;
        
        // Display recommendations
        const recList = document.getElementById('openart-recommendations');
        recList.innerHTML = `
            <li><strong>CFG Scale:</strong> ${result.recommendations.cfg}</li>
            <li><strong>Sampler:</strong> ${result.recommendations.sampler}</li>
            <li><strong>Steps:</strong> ${result.recommendations.steps}</li>
        `;
        
        // Show the result
        document.getElementById('openart-result').style.display = 'block';
    });
    
    // Event listener for copy OpenArt prompt
    document.getElementById('copy-openart-prompt')?.addEventListener('click', () => {
        const prompt = document.getElementById('openart-generated-prompt').textContent;
        navigator.clipboard.writeText(prompt)
            .then(() => {
                const button = document.getElementById('copy-openart-prompt');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard');
            });
    });
    
    // Event listener for Kling motion prompt generation
    document.getElementById('generate-motion-prompt')?.addEventListener('click', () => {
        const basePrompt = document.getElementById('base-prompt').value;
        const motionType = document.getElementById('motion-type').value;
        const intensity = document.getElementById('motion-intensity').value;
        
        // Basic validation
        if (!basePrompt) {
            alert('Please enter a base prompt');
            return;
        }
        
        // Generate the motion prompt
        const motionPrompt = generateKlingMotionPrompt(basePrompt, motionType, intensity);
        
        // Display the prompt
        document.getElementById('motion-generated-prompt').textContent = motionPrompt;
        
        // Show the result
        document.getElementById('motion-result').style.display = 'block';
    });
    
    // Event listener for copy motion prompt
    document.getElementById('copy-motion-prompt')?.addEventListener('click', () => {
        const prompt = document.getElementById('motion-generated-prompt').textContent;
        navigator.clipboard.writeText(prompt)
            .then(() => {
                const button = document.getElementById('copy-motion-prompt');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard');
            });
    });
});