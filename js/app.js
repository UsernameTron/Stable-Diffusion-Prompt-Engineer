document.addEventListener('DOMContentLoaded', () => {
    // Content type modifiers mapping
    const contentTypeModifiers = {
        portrait: ['lighting', 'style', 'expression', 'clothing'],
        landscape: ['time', 'weather', 'style', 'perspective'],
        abstract: ['colors', 'shapes', 'texture', 'mood'],
        concept: ['style', 'lighting', 'perspective', 'details'],
        anime: ['style', 'details', 'expression', 'background']
    };

    // Negative prompt categories
    const negativePromptCategories = {
        quality: 'low quality, blurry, pixelated, jpeg artifacts, compression artifacts, watermark, signature',
        anatomy: 'deformed, blurry, bad anatomy, disfigured, poorly drawn face, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated',
        text: 'text, words, logo, signature, watermark',
        composition: 'poorly framed, unbalanced, bad composition, low contrast, cropped, out of frame'
    };

    // Sampler descriptions
    const samplerDescriptions = {
        ddim: 'DDIM: Fast generation with fewer steps, good for quick drafts',
        euler_a: 'Euler a: Good general-purpose sampler with balance of detail and speed',
        dpm_2m: 'DPM++ 2M Karras: High quality results, good for landscapes and detailed scenes',
        dpm_sde: 'DPM++ SDE Karras: Best for abstract and artistic styles'
    };

    // Model-specific recommended settings
    const modelSettings = {
        'sdxl': {
            portrait: { cfg: 7.5, steps: 30, sampler: 'dpm_2m' },
            landscape: { cfg: 7.0, steps: 25, sampler: 'dpm_2m' },
            abstract: { cfg: 8.0, steps: 25, sampler: 'dpm_sde' },
            concept: { cfg: 7.5, steps: 30, sampler: 'dpm_2m' },
            anime: { cfg: 7.0, steps: 28, sampler: 'euler_a' }
        },
        'sd15': {
            portrait: { cfg: 7.5, steps: 30, sampler: 'euler_a' },
            landscape: { cfg: 7.0, steps: 25, sampler: 'dpm_2m' },
            abstract: { cfg: 8.0, steps: 20, sampler: 'dpm_sde' },
            concept: { cfg: 9.0, steps: 30, sampler: 'dpm_2m' },
            anime: { cfg: 6.0, steps: 25, sampler: 'euler_a' }
        },
        'sd21': {
            portrait: { cfg: 8.5, steps: 35, sampler: 'dpm_2m' },
            landscape: { cfg: 8.0, steps: 30, sampler: 'dpm_2m' },
            abstract: { cfg: 9.0, steps: 25, sampler: 'dpm_sde' },
            concept: { cfg: 8.5, steps: 35, sampler: 'dpm_2m' },
            anime: { cfg: 7.0, steps: 30, sampler: 'euler_a' }
        }
    };
    
    // Model-specific quality enhancers
    const qualityEnhancers = {
        sdxl: 'ultra-detailed, high fidelity, professional quality, masterpiece',
        sd15: 'highly detailed, trending on artstation, sharp focus, exquisite detail',
        sd21: 'ultra-detailed, sharp focus, cinematic lighting, 8k resolution'
    };
    
    // Default negative prompts
    const defaultNegativePrompts = {
        sdxl: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
        sd15: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name',
        sd21: 'nsfw, lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, signature, watermark, username, blurry, artist name, deformed feet, deformed hands, deformed face'
    };

    // Get DOM elements
    const baseConceptField = document.getElementById('baseConceptField');
    const modelSelect = document.getElementById('modelSelect');
    const contentTypeSelect = document.getElementById('contentType');
    const modifiersContainer = document.getElementById('modifiersContainer');
    const promptPreview = document.getElementById('promptPreview');
    const tokenCount = document.getElementById('tokenCount');
    const tokenWarning = document.getElementById('tokenWarning');
    const generateBtn = document.getElementById('generateBtn');
    const resultCard = document.getElementById('resultCard');
    const finalPrompt = document.getElementById('finalPrompt');
    const negativePrompt = document.getElementById('negativePrompt');
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    const copyNegativeBtn = document.getElementById('copyNegativeBtn');
    
    // Parameter selectors
    const cfgOptions = document.querySelectorAll('#cfgOptions .param-option');
    const cfgSlider = document.getElementById('cfgSlider');
    const stepsOptions = document.querySelectorAll('#stepsOptions .param-option');
    const stepsSlider = document.getElementById('stepsSlider');
    const samplerOptions = document.querySelectorAll('#samplerOptions .param-option');
    const samplerDescription = document.getElementById('samplerDescription');
    
    // Negative prompt category checkboxes
    const negativeCategories = document.querySelectorAll('.negative-category');
    
    // Token counting function
    function countTokens(text) {
        if (!text) return 0;
        // Simple approximation: split by spaces and punctuation
        return text.split(/[\s,.!?;:()\[\]{}'"]+/).filter(Boolean).length;
    }
    
    // Update token count and show warnings
    function updateTokenCount(text) {
        const count = countTokens(text);
        tokenCount.textContent = count;
        
        if (count > 75) {
            tokenCount.className = 'badge bg-danger';
            tokenWarning.textContent = 'Warning: Prompt exceeds the 75 token limit for Stable Diffusion. Consider shortening your prompt.';
        } else if (count > 60) {
            tokenCount.className = 'badge bg-warning text-dark';
            tokenWarning.textContent = 'Note: Prompt is approaching the 75 token limit. Consider reducing descriptive terms if adding more.';
        } else {
            tokenCount.className = 'badge bg-secondary';
            tokenWarning.textContent = '';
        }
        
        return count;
    }
    
    // Create modifier options for the selected content type
    function createModifierOptions() {
        const contentType = contentTypeSelect.value;
        const modifiers = contentTypeModifiers[contentType] || [];
        
        modifiersContainer.innerHTML = '';
        
        modifiers.forEach(modifier => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3 mb-3';
            
            const modifierCard = document.createElement('div');
            modifierCard.className = 'card h-100';
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = modifier.charAt(0).toUpperCase() + modifier.slice(1);
            
            const select = document.createElement('select');
            select.className = 'form-select';
            select.id = `${modifier}Select`;
            select.setAttribute('data-modifier', modifier);
            
            // Add a blank option
            const blankOption = document.createElement('option');
            blankOption.value = '';
            blankOption.textContent = `Select ${modifier}`;
            select.appendChild(blankOption);
            
            // Add appropriate options based on modifier type
            let options = [];
            switch (modifier) {
                case 'lighting':
                    options = ['soft', 'dramatic', 'cinematic', 'natural', 'studio', 'golden hour', 'volumetric'];
                    break;
                case 'style':
                    options = ['realistic', 'stylized', 'anime', 'fantasy', 'cinematic', 'photorealistic', 'concept art', 'illustration'];
                    break;
                case 'expression':
                    options = ['happy', 'serious', 'contemplative', 'intense', 'emotional', 'stoic', 'smiling'];
                    break;
                case 'clothing':
                    options = ['casual', 'formal', 'fantasy', 'historical', 'futuristic', 'medieval', 'sci-fi'];
                    break;
                case 'background':
                    options = ['simple', 'nature', 'urban', 'studio', 'gradient', 'blurred', 'detailed'];
                    break;
                case 'time':
                    options = ['day', 'night', 'sunrise', 'sunset', 'golden hour', 'blue hour', 'twilight'];
                    break;
                case 'weather':
                    options = ['clear', 'cloudy', 'rainy', 'foggy', 'snowy', 'stormy', 'misty'];
                    break;
                case 'perspective':
                    options = ['closeup', 'medium shot', 'wide shot', 'aerial', 'panoramic', 'first person', 'low angle'];
                    break;
                case 'details':
                    options = ['detailed', 'highly detailed', 'intricate', 'minimal', 'ornate', 'simple', 'complex'];
                    break;
                case 'mood':
                    options = ['serene', 'dramatic', 'mysterious', 'cheerful', 'gloomy', 'ethereal', 'dark'];
                    break;
                case 'shapes':
                    options = ['geometric', 'organic', 'flowing', 'angular', 'curved', 'chaotic', 'structured'];
                    break;
                case 'texture':
                    options = ['smooth', 'rough', 'grainy', 'glossy', 'matte', 'metallic', 'glass'];
                    break;
                case 'colors':
                    options = ['vibrant', 'muted', 'monochromatic', 'pastel', 'dark', 'bright', 'saturated'];
                    break;
                default:
                    options = ['option 1', 'option 2', 'option 3'];
            }
            
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                select.appendChild(optionElement);
            });
            
            select.addEventListener('change', updatePromptPreview);
            
            cardBody.appendChild(label);
            cardBody.appendChild(select);
            modifierCard.appendChild(cardBody);
            col.appendChild(modifierCard);
            
            modifiersContainer.appendChild(col);
        });
    }
    
    // Update the prompt preview based on inputs
    function updatePromptPreview() {
        const baseConcept = baseConceptField.value.trim();
        if (!baseConcept) {
            promptPreview.textContent = 'Your prompt will appear here...';
            updateTokenCount('');
            return;
        }
        
        // Get all selected modifiers
        const modifiers = [];
        document.querySelectorAll('#modifiersContainer select').forEach(select => {
            if (select.value) {
                const modifierType = select.getAttribute('data-modifier');
                modifiers.push(`${select.value} ${modifierType}`);
            }
        });
        
        // Get the model and add quality enhancers
        const model = modelSelect.value;
        const enhancers = qualityEnhancers[model] || '';
        
        // Build the prompt
        let prompt = baseConcept;
        if (modifiers.length > 0) {
            prompt += ', ' + modifiers.join(', ');
        }
        if (enhancers) {
            prompt += ', ' + enhancers;
        }
        
        promptPreview.textContent = prompt;
        updateTokenCount(prompt);
    }
    
    // Get the current negative prompt based on selections
    function getCurrentNegativePrompt() {
        const model = modelSelect.value;
        let baseNegative = defaultNegativePrompts[model] || '';
        
        // Add selected categories
        const selectedCategories = [];
        negativeCategories.forEach(checkbox => {
            if (checkbox.checked) {
                const categoryId = checkbox.id.replace('neg', '').toLowerCase();
                selectedCategories.push(negativePromptCategories[categoryId]);
            }
        });
        
        if (selectedCategories.length > 0) {
            baseNegative += ', ' + selectedCategories.join(', ');
        }
        
        return baseNegative;
    }
    
    // Generate the final optimized prompt
    function generateOptimizedPrompt() {
        const baseConcept = baseConceptField.value.trim();
        if (!baseConcept) {
            alert('Please enter a base concept first.');
            baseConceptField.focus();
            return;
        }
        
        const model = modelSelect.value;
        const contentType = contentTypeSelect.value;
        
        // Get all selected modifiers
        const modifiers = [];
        document.querySelectorAll('#modifiersContainer select').forEach(select => {
            if (select.value) {
                const modifierType = select.getAttribute('data-modifier');
                modifiers.push(`${select.value} ${modifierType}`);
            }
        });
        
        // Get quality enhancers for model
        const enhancers = qualityEnhancers[model] || '';
        
        // Build optimized prompt
        let optimizedPrompt = baseConcept;
        if (modifiers.length > 0) {
            optimizedPrompt += ', ' + modifiers.join(', ');
        }
        if (enhancers) {
            optimizedPrompt += ', ' + enhancers;
        }
        
        // Set recommended parameters based on model and content type
        const recommended = modelSettings[model]?.[contentType] || { cfg: 7.5, steps: 30, sampler: 'euler_a' };
        
        // Set parameter controls to recommended values
        setParameterValues(recommended);
        
        // Update the negative prompt
        negativePrompt.textContent = getCurrentNegativePrompt();
        
        // Show the final prompt
        finalPrompt.textContent = optimizedPrompt;
        resultCard.style.display = 'block';
        
        // Scroll to results
        resultCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Set parameters to recommended values
    function setParameterValues(params) {
        // Set CFG
        cfgSlider.value = params.cfg;
        cfgOptions.forEach(option => {
            if (option.dataset.value === 'custom') {
                option.classList.remove('active');
            } else if (Number(option.dataset.value) === params.cfg) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Set Steps
        stepsSlider.value = params.steps;
        stepsOptions.forEach(option => {
            if (option.dataset.value === 'custom') {
                option.classList.remove('active');
            } else if (Number(option.dataset.value) === params.steps) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Set Sampler
        samplerOptions.forEach(option => {
            if (option.dataset.value === params.sampler) {
                option.classList.add('active');
                samplerDescription.textContent = samplerDescriptions[params.sampler] || '';
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    // Copy text to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Success feedback could be added here
            })
            .catch(err => {
                console.error('Error copying text:', err);
                alert('Failed to copy text to clipboard');
            });
    }
    
    // Export prompt in different formats
    function exportPrompt() {
        const format = document.getElementById('exportFormat').value;
        const prompt = finalPrompt.textContent;
        const negative = negativePrompt.textContent;
        const cfg = cfgSlider.value;
        const steps = stepsSlider.value;
        const sampler = Array.from(samplerOptions).find(opt => opt.classList.contains('active'))?.dataset.value || 'euler_a';
        const seed = document.getElementById('seedInput').value || '-1';
        
        let exportText = '';
        
        switch (format) {
            case 'automatic1111':
                exportText = `${prompt}\nNegative prompt: ${negative}\nSteps: ${steps}, Sampler: ${sampler}, CFG scale: ${cfg}, Seed: ${seed}`;
                break;
            case 'comfyui':
                exportText = JSON.stringify({
                    prompt: prompt,
                    negative_prompt: negative,
                    steps: Number(steps),
                    cfg: Number(cfg),
                    sampler_name: sampler,
                    seed: seed === '-1' ? -1 : Number(seed)
                }, null, 2);
                break;
            case 'invokeai':
                exportText = `prompt: ${prompt}\nnegative_prompt: ${negative}\nsteps: ${steps}\ncfg_scale: ${cfg}\nsampler: ${sampler}\nseed: ${seed}`;
                break;
            default: // plaintext
                exportText = `${prompt}\n\nNegative prompt: ${negative}\n\nSettings:\n- Steps: ${steps}\n- CFG Scale: ${cfg}\n- Sampler: ${sampler}\n- Seed: ${seed}`;
        }
        
        copyToClipboard(exportText);
        alert('Exported settings copied to clipboard!');
    }
    
    // Initialize parameter option buttons
    function initParameterOptions() {
        // CFG options
        cfgOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                cfgOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                if (option.dataset.value !== 'custom') {
                    cfgSlider.value = option.dataset.value;
                }
            });
        });
        
        cfgSlider.addEventListener('input', () => {
            const customValue = cfgSlider.value;
            cfgOptions.forEach(opt => opt.classList.remove('active'));
            
            // Find if value matches a preset
            const matchingOption = Array.from(cfgOptions).find(opt => 
                opt.dataset.value !== 'custom' && Number(opt.dataset.value) === Number(customValue)
            );
            
            if (matchingOption) {
                matchingOption.classList.add('active');
            } else {
                // Set custom option active
                Array.from(cfgOptions).find(opt => opt.dataset.value === 'custom').classList.add('active');
            }
        });
        
        // Steps options
        stepsOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                stepsOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                if (option.dataset.value !== 'custom') {
                    stepsSlider.value = option.dataset.value;
                }
            });
        });
        
        stepsSlider.addEventListener('input', () => {
            const customValue = stepsSlider.value;
            stepsOptions.forEach(opt => opt.classList.remove('active'));
            
            // Find if value matches a preset
            const matchingOption = Array.from(stepsOptions).find(opt => 
                opt.dataset.value !== 'custom' && Number(opt.dataset.value) === Number(customValue)
            );
            
            if (matchingOption) {
                matchingOption.classList.add('active');
            } else {
                // Set custom option active
                Array.from(stepsOptions).find(opt => opt.dataset.value === 'custom').classList.add('active');
            }
        });
        
        // Sampler options
        samplerOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                samplerOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                samplerDescription.textContent = samplerDescriptions[option.dataset.value] || '';
            });
        });
        
        // Random seed button
        document.getElementById('randomSeedBtn').addEventListener('click', () => {
            const randomSeed = Math.floor(Math.random() * 2147483647);
            document.getElementById('seedInput').value = randomSeed;
        });
    }
    
    // Initialize event listeners
    baseConceptField.addEventListener('input', updatePromptPreview);
    modelSelect.addEventListener('change', updatePromptPreview);
    contentTypeSelect.addEventListener('change', () => {
        createModifierOptions();
        updatePromptPreview();
    });
    
    generateBtn.addEventListener('click', generateOptimizedPrompt);
    copyPromptBtn.addEventListener('click', () => copyToClipboard(finalPrompt.textContent));
    copyNegativeBtn.addEventListener('click', () => copyToClipboard(negativePrompt.textContent));
    document.getElementById('exportBtn').addEventListener('click', exportPrompt);
    
    negativeCategories.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            negativePrompt.textContent = getCurrentNegativePrompt();
        });
    });
    
    // Initialize the page
    createModifierOptions();
    initParameterOptions();
    updatePromptPreview();
});