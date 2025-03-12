document.addEventListener('DOMContentLoaded', () => {
    // Content type modifiers mapping
    const contentTypeModifiers = {
        portrait: ['lighting', 'style', 'expression', 'clothing', 'background'],
        landscape: ['time', 'weather', 'lighting', 'perspective', 'style'],
        concept: ['style', 'lighting', 'perspective', 'details', 'mood'],
        urban: ['lighting', 'time', 'weather', 'style', 'details'],
        anime: ['style', 'details', 'expression', 'background', 'colors'],
        surreal: ['style', 'elements', 'colors', 'mood', 'perspective'],
        fantasy: ['lighting', 'environment', 'style', 'details', 'atmosphere'],
        stillLife: ['lighting', 'arrangement', 'style', 'colors', 'mood']
    };

    // Negative prompt category definitions
    const negativeCategories = [
        { id: 'quality', label: 'Quality Issues', terms: 'low quality, blurry, pixelated, jpeg artifacts, compression artifacts, watermark, signature' },
        { id: 'anatomy', label: 'Anatomical Issues', terms: 'bad anatomy, deformed, disfigured, mutated, extra limbs, missing limbs, extra fingers, fewer digits' },
        { id: 'composition', label: 'Composition Issues', terms: 'poorly framed, unbalanced, bad composition, low contrast, cropped, out of frame' },
        { id: 'technical', label: 'Technical Issues', terms: 'text, words, font, logo, distorted, warped perspective, unrealistic proportions' }
    ];

    // Initialize tooltips
    function initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Helper functions
    function weightWord(word, model, emphasis) {
        const defaultEmphasis = 1.1;
        const actualEmphasis = emphasis || defaultEmphasis;
        
        if (model === 'sdxl') {
            if (actualEmphasis >= 1.3) {
                return `(((${word})))`;
            } else if (actualEmphasis >= 1.2) {
                return `((${word}))`;
            } else {
                return `(${word})`;
            }
        } else if (model === 'sd15') {
            if (actualEmphasis >= 1.3) {
                return `((${word}))`;
            } else if (actualEmphasis >= 1.2) {
                return `(${word})`;
            } else {
                return `${word}:${actualEmphasis.toFixed(1)}`;
            }
        } else { // sd21
            return `(${word}:${actualEmphasis.toFixed(1)})`;
        }
    }
    
    // Token counting and optimization
    function countTokens(text) {
        // Simple approximation: split by spaces and punctuation
        return text.split(/[\s,.!?;:()\[\]{}'"]+/).filter(Boolean).length;
    }
    
    function updateTokenCount(text) {
        const tokenCount = countTokens(text);
        const tokenCountElement = document.getElementById('tokenCount');
        if (tokenCountElement) {
            tokenCountElement.textContent = tokenCount;
            
            // Visual feedback based on token count
            if (tokenCount > 60) {
                tokenCountElement.className = 'badge bg-danger me-2';
            } else if (tokenCount > 45) {
                tokenCountElement.className = 'badge bg-warning me-2';
            } else {
                tokenCountElement.className = 'badge bg-success me-2';
            }
        }
        
        // Provide optimization suggestions
        const optimizationSuggestions = suggestOptimizations(text, tokenCount);
        const tokenOptimizationElement = document.getElementById('token-optimization');
        if (tokenOptimizationElement && optimizationSuggestions.length > 0) {
            tokenOptimizationElement.innerHTML = '<strong>Optimization tips:</strong> ' + 
                optimizationSuggestions.map(s => `<span class="text-danger">• ${s}</span>`).join('<br>');
        } else if (tokenOptimizationElement) {
            tokenOptimizationElement.innerHTML = '';
        }
        
        return tokenCount;
    }
    
    function suggestOptimizations(prompt, tokenCount) {
        const suggestions = [];
        
        if (tokenCount > 60) {
            suggestions.push('Your prompt is approaching the token limit. Consider reducing descriptive terms.');
        }
        
        // Check for redundant adjectives
        const tokens = prompt.split(/\s+/);
        const adjectives = tokens.filter(t => t.endsWith('ing') || t.endsWith('ed') || t.endsWith('ive'));
        if (adjectives.length > 5) {
            suggestions.push('Multiple descriptive adjectives detected - consider consolidating similar terms.');
        }
        
        // Check for repetitive style mentions
        const styles = tokens.filter(t => 
            ['style', 'artistic', 'painting', 'photo', 'render', 'quality', 'detailed'].some(s => t.includes(s))
        );
        if (styles.length > 3) {
            suggestions.push('Multiple style references detected - consider focusing on the most important style terms.');
        }
        
        return suggestions;
    }

    function generatePrompt(model, contentType, options) {
        const modelInfo = modelData[model];
        const template = contentTemplates[contentType];
        
        if (!modelInfo || !template) {
            return { error: 'Invalid model or content type' };
        }
        
        let basePrompt = template.basePrompt;
        const elements = template.keyElements;
        
        // Replace placeholders with options or defaults
        for (const [key, values] of Object.entries(elements)) {
            const placeholder = `[${key}]`;
            let replacement = options[key] || values[0];
            
            // Apply weighting to important elements
            if (['subject', 'style', 'artist'].includes(key)) {
                replacement = weightWord(replacement, model, 1.2);
            }
            
            basePrompt = basePrompt.replace(placeholder, replacement);
        }
        
        // Check token count (rough approximation, actual tokenization would be more complex)
        const approxTokens = basePrompt.split(' ').length;
        
        return {
            prompt: basePrompt,
            approxTokens,
            tokenLimit: modelInfo.tokenLimit,
            model: modelInfo.name,
            recommendedParameters: modelInfo.recommendedParameters,
            weightingTechnique: modelInfo.weightingTechnique
        };
    }

    function generateNegativePrompt(model, contentType) {
        const modelInfo = modelData[model];
        const template = contentTemplates[contentType];
        
        if (!modelInfo || !template) {
            return { error: 'Invalid model or content type' };
        }
        
        return {
            negativePrompt: `${modelInfo.negativePromptBase}, ${template.negativeAdditions}`,
            model: modelInfo.name
        };
    }

    function analyzeResult(issueType, specificProblem) {
        let analysis;
        
        if (specificProblem) {
            // Specific issue analysis
            if (issueType === 'quality' && resultAnalysisPatterns.qualityIssues[specificProblem]) {
                analysis = resultAnalysisPatterns.qualityIssues[specificProblem];
            } else if (issueType === 'portrait' && resultAnalysisPatterns.subjectIssues.portraits[specificProblem]) {
                analysis = resultAnalysisPatterns.subjectIssues.portraits[specificProblem];
            } else if (issueType === 'landscape' && resultAnalysisPatterns.subjectIssues.landscapes[specificProblem]) {
                analysis = resultAnalysisPatterns.subjectIssues.landscapes[specificProblem];
            } else if (issueType === 'common' && resultAnalysisPatterns.commonProblems[specificProblem]) {
                analysis = resultAnalysisPatterns.commonProblems[specificProblem];
            } else {
                return { error: 'Invalid issue type or specific problem' };
            }
        } else {
            // General category suggestions
            if (issueType === 'quality') {
                analysis = {
                    suggestions: [
                        'Increase step count for more detail',
                        'Adjust CFG scale (7-9 is balanced)',
                        'Add quality enhancers to prompt (highly detailed, masterpiece, etc.)',
                        'Use appropriate negative prompts for the model'
                    ]
                };
            } else if (issueType === 'portrait') {
                analysis = {
                    suggestions: [
                        'Use strong negative prompts for anatomical issues',
                        'Add facial feature descriptors for better definition',
                        'Specify lighting terms for better rendering',
                        'Consider LoRA for consistent character generation'
                    ]
                };
            } else if (issueType === 'landscape') {
                analysis = {
                    suggestions: [
                        'Specify perspective and time of day clearly',
                        'Use reference terms like "award-winning photography"',
                        'Specify weather and atmospheric conditions',
                        'Add depth-related terms for better spatial relationships'
                    ]
                };
            } else {
                return { error: 'Invalid issue type' };
            }
        }
        
        return analysis;
    }

    function getControlNetRecommendation(technique) {
        const guide = controlNetGuides[technique];
        
        if (!guide) {
            return { 
                error: 'Invalid ControlNet technique',
                availableTechniques: Object.keys(controlNetGuides)
            };
        }
        
        return guide;
    }

    function getArtistStyleInfo(category, artistName) {
        const artists = modifierLibrary.artists[category];
        
        if (!artists) {
            return {
                error: 'Invalid artist category',
                availableCategories: Object.keys(modifierLibrary.artists)
            };
        }
        
        const artist = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
        
        if (!artist) {
            return {
                error: 'Artist not found',
                availableArtists: artists.map(a => a.name)
            };
        }
        
        return artist;
    }

    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Prompt Generator
    const modelSelect = document.getElementById('model-select');
    const contentTypeSelect = document.getElementById('content-type');
    const customOptions = document.getElementById('custom-options');
    const generatePromptBtn = document.getElementById('generate-prompt-btn');
    const promptResult = document.getElementById('prompt-result');
    const promptText = document.getElementById('prompt-text');
    const copyPromptBtn = document.getElementById('copy-prompt-btn');
    const parameterGuidance = document.getElementById('parameter-guidance');
    const parameterRecommendations = document.getElementById('parameter-recommendations');
    
    // Populate custom options based on content type
    contentTypeSelect.addEventListener('change', () => {
        updateCustomOptions();
    });
    
    function updateCustomOptions() {
        const contentType = contentTypeSelect.value;
        const template = contentTemplates[contentType];
        
        if (!template) return;
        
        let html = '';
        
        // Get key elements from the template
        for (const [key, values] of Object.entries(template.keyElements)) {
            html += `
                <div class="form-group">
                    <label for="${key}-input">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input type="text" id="${key}-input" placeholder="Enter ${key}" value="${values[0]}">
                </div>
            `;
        }
        
        customOptions.innerHTML = html;
    }
    
    // Initialize custom options
    // Setup negative categories
    function setupNegativeCategories() {
        const container = document.getElementById('negativeCategories');
        if (!container) return;
        
        container.innerHTML = '';
        
        negativeCategories.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'form-check mb-2';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'form-check-input';
            input.id = `neg-${cat.id}`;
            input.setAttribute('data-terms', cat.terms);
            input.checked = cat.id === 'quality'; // Check quality issues by default
            input.addEventListener('change', updateNegativePreview);
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `neg-${cat.id}`;
            label.textContent = cat.label;
            
            const small = document.createElement('small');
            small.className = 'form-text text-muted d-block';
            small.textContent = cat.terms;
            
            div.append(input, label, small);
            container.appendChild(div);
        });
    }
    
    // Create toggle buttons for modifiers
    function createModifierToggles() {
        const container = document.getElementById('modifier-toggles');
        if (!container) return;
        
        const contentType = contentTypeSelect.value;
        const modifiers = contentTypeModifiers[contentType] || [];
        
        container.innerHTML = '';
        
        modifiers.forEach(modifier => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3 mb-2';
            
            const card = document.createElement('div');
            card.className = 'card h-100';
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body p-2';
            
            const label = document.createElement('div');
            label.className = 'fw-bold mb-2 small';
            label.textContent = modifier.charAt(0).toUpperCase() + modifier.slice(1);
            
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'btn-group btn-group-sm d-flex flex-wrap gap-1';
            
            // Get appropriate options based on modifier type
            let options = [];
            switch (modifier) {
                case 'lighting':
                    options = ['soft', 'dramatic', 'cinematic', 'natural', 'studio'];
                    break;
                case 'style':
                    options = ['realistic', 'stylized', 'anime', 'fantasy', 'cinematic'];
                    break;
                case 'expression':
                    options = ['happy', 'serious', 'calm', 'intense', 'thoughtful'];
                    break;
                case 'clothing':
                    options = ['casual', 'formal', 'fantasy', 'medieval', 'futuristic'];
                    break;
                case 'background':
                    options = ['simple', 'nature', 'urban', 'studio', 'gradient'];
                    break;
                case 'time':
                    options = ['day', 'night', 'sunrise', 'sunset', 'golden hour'];
                    break;
                case 'weather':
                    options = ['clear', 'cloudy', 'rainy', 'foggy', 'snowy'];
                    break;
                case 'perspective':
                    options = ['closeup', 'medium', 'wide', 'aerial', 'panoramic'];
                    break;
                case 'details':
                    options = ['detailed', 'minimal', 'intricate', 'simple', 'ornate'];
                    break;
                case 'colors':
                    options = ['vibrant', 'muted', 'monochrome', 'pastel', 'dark'];
                    break;
                case 'mood':
                    options = ['serene', 'dramatic', 'mysterious', 'cheerful', 'gloomy'];
                    break;
                case 'elements':
                    options = ['water', 'fire', 'nature', 'abstract', 'geometric'];
                    break;
                case 'atmosphere':
                    options = ['magical', 'ethereal', 'gritty', 'dreamlike', 'peaceful'];
                    break;
                case 'arrangement':
                    options = ['organized', 'chaotic', 'balanced', 'centered', 'asymmetric'];
                    break;
                case 'environment':
                    options = ['forest', 'mountains', 'coast', 'city', 'fantasy'];
                    break;
                default:
                    options = ['option 1', 'option 2', 'option 3'];
            }
            
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-outline-primary btn-sm mb-1 me-1';
                btn.textContent = option;
                btn.dataset.modifier = modifier;
                btn.dataset.value = option;
                btn.onclick = () => {
                    btn.classList.toggle('active');
                    updatePromptPreview();
                };
                buttonGroup.appendChild(btn);
            });
            
            cardBody.append(label, buttonGroup);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
        });
    }
    
    // Get selected modifiers from toggle buttons
    function getSelectedModifiers() {
        const modifiers = {};
        const activeButtons = document.querySelectorAll('#modifier-toggles .btn.active');
        
        activeButtons.forEach(btn => {
            const category = btn.dataset.modifier;
            const value = btn.dataset.value;
            
            if (!modifiers[category]) {
                modifiers[category] = [];
            }
            
            modifiers[category].push(value);
        });
        
        return modifiers;
    }
    
    // Update the prompt preview
    function updatePromptPreview() {
        const baseConcept = document.getElementById('baseConceptField').value;
        const model = modelSelect.value;
        const contentType = contentTypeSelect.value;
        const modifiers = getSelectedModifiers();
        
        // Build the prompt from base concept and modifiers
        let previewPrompt = baseConcept;
        
        // Add selected modifiers
        Object.entries(modifiers).forEach(([category, values]) => {
            if (values.length > 0) {
                previewPrompt += `, ${values.join(' and ')} ${category}`;
            }
        });
        
        // Add model-specific quality enhancers
        if (model === 'sdxl') {
            previewPrompt += ', ultra-detailed, high fidelity';
        } else if (model === 'sd15') {
            previewPrompt += ', highly detailed, trending on artstation';
        } else if (model === 'sd21') {
            previewPrompt += ', ultra-detailed, sharp focus';
        }
        
        const promptPreview = document.getElementById('promptPreview');
        if (promptPreview) {
            promptPreview.textContent = previewPrompt;
            updateTokenCount(previewPrompt);
        }
    }
    
    // Update negative prompt preview
    function updateNegativePreview() {
        const model = document.getElementById('neg-model-select').value;
        const contentType = document.getElementById('neg-content-type').value;
        
        // Get base negative prompt
        let negativePrompt = modelData[model]?.negativePromptBase || '';
        
        // Add content-specific negative terms
        const contentNegative = contentTemplates[contentType]?.negativeAdditions || '';
        if (contentNegative) {
            negativePrompt += ', ' + contentNegative;
        }
        
        // Add selected category terms
        const checkedCategories = document.querySelectorAll('#negativeCategories input:checked');
        checkedCategories.forEach(checkbox => {
            const terms = checkbox.getAttribute('data-terms');
            if (terms) {
                negativePrompt += ', ' + terms;
            }
        });
        
        return negativePrompt;
    }

    // Initialize functions
    updateCustomOptions();
    createModifierToggles();
    setupNegativeCategories();
    initTooltips();
    
    // Event listeners for updates
    document.getElementById('baseConceptField')?.addEventListener('input', updatePromptPreview);
    contentTypeSelect?.addEventListener('change', () => {
        updateCustomOptions();
        createModifierToggles();
        updatePromptPreview();
    });
    
    // Generate prompt
    generatePromptBtn.addEventListener('click', () => {
        const model = modelSelect.value;
        const contentType = contentTypeSelect.value;
        const baseConcept = document.getElementById('baseConceptField').value;
        const options = {};
        
        // Gather custom options
        const inputs = customOptions.querySelectorAll('input');
        inputs.forEach(input => {
            const key = input.id.replace('-input', '');
            if (input.value) {
                options[key] = input.value;
            }
        });
        
        // Get modifiers
        const modifiers = getSelectedModifiers();
        Object.entries(modifiers).forEach(([category, values]) => {
            options[category] = values.join(' and ');
        });
        
        // Include base concept if provided
        if (baseConcept) {
            options.baseConcept = baseConcept;
        }
        
        const result = generatePrompt(model, contentType, options);
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        // Format prompt based on model-specific optimizations from test data
        let formattedPrompt = baseConcept ? baseConcept + ', ' + result.prompt : result.prompt;
        
        // Model-specific optimizations
        if (model === 'sdxl') {
            // Ensure prompts have high-fidelity and ultra-detailed quality terms
            if (!formattedPrompt.includes('high fidelity') && !formattedPrompt.includes('ultra-detailed')) {
                formattedPrompt = formattedPrompt.replace(/quality/, 'ultra-detailed, high fidelity, quality');
            }
            // Ensure cinematic lighting for visual impact
            if (!formattedPrompt.includes('cinematic lighting')) {
                formattedPrompt = formattedPrompt.replace(/lighting/, 'cinematic lighting');
            }
        } else if (model === 'sd15') {
            // Ensure trending on artstation and highly detailed for SD 1.5
            if (!formattedPrompt.includes('trending on artstation')) {
                formattedPrompt = formattedPrompt.replace(/quality/, 'highly detailed, trending on artstation, quality');
            }
            // Emphasize professional photography terms for portraits
            if (contentType === 'portrait' && !formattedPrompt.includes('professional photograph')) {
                formattedPrompt = formattedPrompt.replace(/medium/, 'professional photograph');
            }
        } else if (model === 'sd21') {
            // Add ultra-detailed and sharp focus for SD 2.1
            if (!formattedPrompt.includes('ultra-detailed')) {
                formattedPrompt = formattedPrompt.replace(/quality/, 'ultra-detailed, quality');
            }
            if (contentType === 'landscape' && !formattedPrompt.includes('atmospheric')) {
                formattedPrompt = formattedPrompt.replace(/lighting/, 'atmospheric, lighting');
            }
        }
        
        // Update token count
        updateTokenCount(formattedPrompt);
        
        promptText.textContent = formattedPrompt;
        promptResult.style.display = 'block';
        
        // Show parameter recommendations
        const params = result.recommendedParameters;
        let paramsHtml = '<div class="parameter-card">';
        
        paramsHtml += `
            <div class="parameter-item">
                <h3>CFG Scale</h3>
                <p>Range: ${params.cfgRange.min} - ${params.cfgRange.max}</p>
                <p>Default: ${params.cfgRange.default}</p>
            </div>
            
            <div class="parameter-item">
                <h3>Recommended Samplers</h3>
                <ul>
                    ${params.samplers.map(sampler => `<li>${sampler}</li>`).join('')}
                </ul>
            </div>
            
            <div class="parameter-item">
                <h3>Steps</h3>
                <p>Range: ${params.steps.min} - ${params.steps.max}</p>
                <p>Default: ${params.steps.default}</p>
            </div>
        `;
        
        paramsHtml += '</div>';
        parameterRecommendations.innerHTML = paramsHtml;
        parameterGuidance.style.display = 'block';
    });
    
    // Copy prompt
    copyPromptBtn.addEventListener('click', () => {
        const text = promptText.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                const originalText = copyPromptBtn.textContent;
                copyPromptBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyPromptBtn.textContent = originalText;
                }, 1500);
            })
            .catch(err => {
                console.error('Error copying text:', err);
                alert('Could not copy to clipboard. Please select and copy manually.');
            });
    });
    
    // Negative Prompts
    const negModelSelect = document.getElementById('neg-model-select');
    const negContentType = document.getElementById('neg-content-type');
    const generateNegativeBtn = document.getElementById('generate-negative-btn');
    const negativeResult = document.getElementById('negative-result');
    const negativeText = document.getElementById('negative-text');
    const copyNegativeBtn = document.getElementById('copy-negative-btn');
    
    generateNegativeBtn.addEventListener('click', () => {
        const model = negModelSelect.value;
        const contentType = negContentType.value;
        
        const result = generateNegativePrompt(model, contentType);
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        negativeText.textContent = result.negativePrompt;
        negativeResult.style.display = 'block';
    });
    
    copyNegativeBtn.addEventListener('click', () => {
        const text = negativeText.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                const originalText = copyNegativeBtn.textContent;
                copyNegativeBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyNegativeBtn.textContent = originalText;
                }, 1500);
            })
            .catch(err => {
                console.error('Error copying text:', err);
                alert('Could not copy to clipboard. Please select and copy manually.');
            });
    });
    
    // Parameter Optimization
    const paramModelSelect = document.getElementById('param-model-select');
    const getParametersBtn = document.getElementById('get-parameters-btn');
    const paramsResult = document.getElementById('params-result');
    const cfgGuidance = document.getElementById('cfg-guidance');
    const samplerGuidance = document.getElementById('sampler-guidance');
    const stepsGuidance = document.getElementById('steps-guidance');
    const strengthGuidance = document.getElementById('strength-guidance');
    
    getParametersBtn.addEventListener('click', () => {
        const model = paramModelSelect.value;
        const modelInfo = modelData[model];
        
        if (!modelInfo) {
            alert('Invalid model selection');
            return;
        }
        
        const params = modelInfo.recommendedParameters;
        
        cfgGuidance.innerHTML = `
            <p><strong>Range:</strong> ${params.cfgRange.min} - ${params.cfgRange.max}</p>
            <p><strong>Default:</strong> ${params.cfgRange.default}</p>
            <p class="text-small">
                Low: More creative freedom (5-7)<br>
                Mid: Balanced (7-9)<br>
                High: Precise prompt adherence (9-12)
            </p>
        `;
        
        samplerGuidance.innerHTML = `
            <p><strong>Recommended (in order):</strong></p>
            <ol>
                ${params.samplers.map(sampler => `<li>${sampler}</li>`).join('')}
            </ol>
            <p class="text-small">
                DDIM: Faster results<br>
                Euler a: Balanced<br>
                DPM++: Higher quality
            </p>
        `;
        
        stepsGuidance.innerHTML = `
            <p><strong>Range:</strong> ${params.steps.min} - ${params.steps.max}</p>
            <p><strong>Default:</strong> ${params.steps.default}</p>
            <p class="text-small">
                Low: Quick drafts (20-25)<br>
                Mid: Standard quality (30-40)<br>
                High: Maximum detail (40-60)
            </p>
        `;
        
        strengthGuidance.innerHTML = `
            <p><strong>Range:</strong> ${params.strength.min} - ${params.strength.max}</p>
            <p><strong>Default:</strong> ${params.strength.default}</p>
            <p class="text-small">
                Low: Subtle changes (0.2-0.4)<br>
                Mid: Balanced (0.5-0.7)<br>
                High: Major changes (0.7-0.9)
            </p>
        `;
        
        paramsResult.style.display = 'block';
    });
    
    // ControlNet Guide
    const controlnetSelect = document.getElementById('controlnet-select');
    const getControlnetBtn = document.getElementById('get-controlnet-btn');
    const controlnetResult = document.getElementById('controlnet-result');
    
    getControlnetBtn.addEventListener('click', () => {
        const technique = controlnetSelect.value;
        const guide = getControlNetRecommendation(technique);
        
        if (guide.error) {
            alert(guide.error);
            return;
        }
        
        let html = `
            <h3>${controlnetSelect.options[controlnetSelect.selectedIndex].text}</h3>
            <p><strong>Description:</strong> ${guide.description}</p>
            <p><strong>Usage:</strong> ${guide.usage}</p>
            <p><strong>Prompt Tips:</strong> ${guide.promptTips}</p>
            <p><strong>Strength:</strong> ${guide.strengthRecommendation}</p>
            <p><strong>Best Models:</strong> ${guide.bestModels}</p>
        `;
        
        controlnetResult.innerHTML = html;
        controlnetResult.style.display = 'block';
    });
    
    // Result Analysis
    const issueTypeSelect = document.getElementById('issue-type');
    const specificProblemSelect = document.getElementById('specific-problem');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analysisResult = document.getElementById('analysis-result');
    
    // Update specific problem options based on issue type
    issueTypeSelect.addEventListener('change', () => {
        const issueType = issueTypeSelect.value;
        specificProblemSelect.innerHTML = '<option value="">General advice</option>';
        
        let options = [];
        
        switch (issueType) {
            case 'quality':
                options = Object.keys(resultAnalysisPatterns.qualityIssues);
                break;
            case 'portrait':
                options = Object.keys(resultAnalysisPatterns.subjectIssues.portraits);
                break;
            case 'landscape':
                options = Object.keys(resultAnalysisPatterns.subjectIssues.landscapes);
                break;
            case 'common':
                options = Object.keys(resultAnalysisPatterns.commonProblems);
                break;
        }
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            specificProblemSelect.appendChild(optionElement);
        });
    });
    
    analyzeBtn.addEventListener('click', () => {
        const issueType = issueTypeSelect.value;
        const specificProblem = specificProblemSelect.value;
        
        const result = analyzeResult(issueType, specificProblem);
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        let html = '';
        
        if (result.symptoms) {
            html += `<p><strong>Symptoms:</strong> ${result.symptoms}</p>`;
            html += `<p><strong>Causes:</strong> ${result.causes}</p>`;
            html += `<p><strong>Solutions:</strong> ${result.solutions}</p>`;
        } else if (result.suggestions) {
            html += '<p><strong>Suggestions:</strong></p>';
            html += '<ul>';
            result.suggestions.forEach(suggestion => {
                html += `<li>${suggestion}</li>`;
            });
            html += '</ul>';
        }
        
        analysisResult.innerHTML = html;
        analysisResult.style.display = 'block';
    });
    
    // Initialize specific problem options
    issueTypeSelect.dispatchEvent(new Event('change'));
    
    // Modifier Library
    const modifierCategory = document.getElementById('modifier-category');
    const subcategoryContainer = document.getElementById('subcategory-container');
    const modifierSubcategory = document.getElementById('modifier-subcategory');
    const getModifiersBtn = document.getElementById('get-modifiers-btn');
    const modifiersResult = document.getElementById('modifiers-result');
    
    // Update subcategory options based on category
    modifierCategory.addEventListener('change', () => {
        const category = modifierCategory.value;
        const categoryData = modifierLibrary[category];
        
        if (!categoryData) {
            subcategoryContainer.style.display = 'none';
            return;
        }
        
        const subcategories = Object.keys(categoryData);
        
        if (subcategories.length > 0) {
            modifierSubcategory.innerHTML = '';
            
            subcategories.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory;
                option.textContent = subcategory.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                modifierSubcategory.appendChild(option);
            });
            
            subcategoryContainer.style.display = 'block';
        } else {
            subcategoryContainer.style.display = 'none';
        }
    });
    
    getModifiersBtn.addEventListener('click', () => {
        const category = modifierCategory.value;
        const categoryData = modifierLibrary[category];
        
        if (!categoryData) {
            alert('Invalid category');
            return;
        }
        
        const subCategory = subcategoryContainer.style.display === 'none' ? null : modifierSubcategory.value;
        let modifiers;
        
        if (subCategory && categoryData[subCategory]) {
            modifiers = categoryData[subCategory];
        } else {
            modifiers = categoryData;
        }
        
        let html = '';
        
        if (Array.isArray(modifiers)) {
            // Simple array of strings or objects
            modifiers.forEach(modifier => {
                if (typeof modifier === 'object' && modifier.name) {
                    // Artist objects with name and style
                    html += `
                        <div class="grid-item">
                            <h3>${modifier.name}</h3>
                            <p>${modifier.style}</p>
                            <button class="copy-button" data-text="${modifier.name}">Copy</button>
                        </div>
                    `;
                } else {
                    // Simple string modifier
                    html += `
                        <div class="grid-item">
                            <p>${modifier}</p>
                            <button class="copy-button" data-text="${modifier}">Copy</button>
                        </div>
                    `;
                }
            });
        } else {
            // Object with subcategories
            for (const [key, value] of Object.entries(modifiers)) {
                html += `<h3>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>`;
                html += '<div class="grid">';
                
                if (Array.isArray(value)) {
                    value.forEach(modifier => {
                        if (typeof modifier === 'object' && modifier.name) {
                            // Artist objects with name and style
                            html += `
                                <div class="grid-item">
                                    <h3>${modifier.name}</h3>
                                    <p>${modifier.style}</p>
                                    <button class="copy-button" data-text="${modifier.name}">Copy</button>
                                </div>
                            `;
                        } else {
                            // Simple string modifier
                            html += `
                                <div class="grid-item">
                                    <p>${modifier}</p>
                                    <button class="copy-button" data-text="${modifier}">Copy</button>
                                </div>
                            `;
                        }
                    });
                }
                
                html += '</div>';
            }
        }
        
        modifiersResult.innerHTML = html;
        modifiersResult.style.display = 'block';
        
        // Add event listeners to copy buttons
        const copyButtons = modifiersResult.querySelectorAll('.copy-button');
        copyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const text = button.getAttribute('data-text');
                navigator.clipboard.writeText(text)
                    .then(() => {
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = originalText;
                        }, 1500);
                    })
                    .catch(err => {
                        console.error('Error copying text:', err);
                        alert('Could not copy to clipboard. Please select and copy manually.');
                    });
            });
        });
    });
    
    // Initialize the first category's subcategories
    modifierCategory.dispatchEvent(new Event('change'));
    
    // Example prompts copy buttons
    const copyExampleBtns = document.querySelectorAll('.copy-example-btn');
    copyExampleBtns.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.getAttribute('data-text');
            navigator.clipboard.writeText(text)
                .then(() => {
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Error copying text:', err);
                    alert('Could not copy to clipboard. Please select and copy manually.');
                });
        });
    });
});