document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.querySelector('.terminal .output');
    const openTerminalBtn = document.getElementById('open-terminal-btn');
    const terminalWindow = document.getElementById('terminal-window');
    const closeButton = terminalWindow.querySelector('.close');
    const minimizeButton = terminalWindow.querySelector('.minimize');
    const expandButton = terminalWindow.querySelector('.expand');
    const promptSpan = document.querySelector('.prompt');

    let isDragging = false;
    let offsetX, offsetY;
    let isMaximized = false;
    let originalSize = { width: '600px', height: '400px', top: '50px', left: '50px' };
    let clickCount = 0;
    let lastLoginTime = null;
    let isMinimized = false;
    let isFirstOpen = true;

    // --- DIRECTORY STATE ---
    let currentDirectory = '~';

    // --- DATA ---
    const poems = {
        "Yasamaya_Deger.txt": "Hayat belki de,\nBir bardak süttü.\nKırmızı oyuncak araba.\nKabuğu kopmuş diz yarası,\nDenizde sektirilen düz taş parçası.\nAlkışların koptuğu perde arası,\nAyrılık sonrası akan gözyaşı...",
        "Ask.txt": "Gözlerim dans ediyor,\nGörmüyor musun?\nVücudum gevşiyor,\nHissetmiyor musun?\nGöğüslerinde uyumak istiyorum,\nAnlamıyor musun?\n___\nGerek kalmadı,\nGeç de olsa anladım.\nAşk acıtmaz,\nSadece gerçek değilsin.\nÖldüm ve yeniden doğdum,\nUmut ve Hayal Kırıklığı,\nSen ve Ben,\nArtık yok.",
    };

    const rootFiles = [
        "about.txt",
        "projects.txt",
        "contact.txt",
        "cv.pdf",
        "poems/" 
    ];

    const greetingArt = `
 ██████╗ █████╗ ███╗   ██╗███████╗    ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔════╝██╔══██╗████╗  ██║██╔════╝    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██║     ███████║██╔██╗ ██║███████╗    ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██║     ██╔══██║██║╚██╗██║╚════██║    ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
╚██████╗██║  ██║██║ ╚████║███████║    ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`;

    const displayLastLogin = () => {
        if (lastLoginTime) {
            addOutput(`Last login: ${lastLoginTime}`, false);
        }
    };

    const displayGreeting = () => {
        addOutput("Welcome to the terminal! Type 'help' for commands.", false);
    };

    const addOutput = (message, isCommand = false) => {
        if (typeof message === 'string') {
            const lines = message.split('\n');
            lines.forEach(lineText => {
                const line = document.createElement('div');
                line.className = isCommand ? 'command-line' : 'output-line';
                if (isCommand) {
                    line.textContent = `user@portfolio:${currentDirectory}$ ${lineText}`;
                } else {
                    line.textContent = lineText;
                }
                terminalOutput.appendChild(line);
            });
        } else {
            const line = document.createElement('div');
            line.className = isCommand ? 'command-line' : 'output-line';
            line.appendChild(message);
            terminalOutput.appendChild(line);
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const addGreetingOutput = (greeting) => {
        const lines = greeting.split('\n');
        lines.forEach(lineText => {
            const line = document.createElement('div');
            line.className = 'output-line';
            line.textContent = lineText;
            terminalOutput.appendChild(line);
        });
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const initializeTerminal = () => {
        terminalOutput.innerHTML = '';
        currentDirectory = '~';
        promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
        displayLastLogin();
        displayGreeting();
        isFirstOpen = false;
    };

    openTerminalBtn.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 2) {
            terminalWindow.classList.remove('hidden');
            clickCount = 0;
            if (!isMinimized) {
                initializeTerminal();
            }
            isMinimized = false;
            updateLastLogin();
        }
    });

    closeButton.addEventListener('click', () => {
        terminalWindow.classList.add('hidden');
        terminalOutput.innerHTML = '';
        isMinimized = false;
        isFirstOpen = true;
        updateLastLogin();
    });

    minimizeButton.addEventListener('click', () => {
        terminalWindow.classList.add('hidden');
        isMinimized = true;
    });

    expandButton.addEventListener('click', () => {
        if (isMaximized) {
            terminalWindow.style.width = originalSize.width;
            terminalWindow.style.height = originalSize.height;
            terminalWindow.style.top = originalSize.top;
            terminalWindow.style.left = originalSize.left;
            terminalWindow.classList.remove('maximized');
        } else {
            originalSize = {
                width: terminalWindow.style.width,
                height: terminalWindow.style.height,
                top: terminalWindow.style.top,
                left: terminalWindow.style.left
            };
            terminalWindow.style.width = '98%';
            terminalWindow.style.height = '97%';
            terminalWindow.style.top = '1.5%';
            terminalWindow.style.left = '1%';
            terminalWindow.classList.add('maximized');
        }
        isMaximized = !isMaximized;
    });

    const titleBar = terminalWindow.querySelector('.title-bar');
    titleBar.addEventListener('mousedown', (e) => {
        if (isMaximized) return;
        isDragging = true;
        offsetX = e.clientX - terminalWindow.getBoundingClientRect().left;
        offsetY = e.clientY - terminalWindow.getBoundingClientRect().top;
        terminalWindow.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && !isMaximized) {
            const screenRect = document.querySelector('.screen').getBoundingClientRect();
            const windowRect = terminalWindow.getBoundingClientRect();
            
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;

            newLeft = Math.max(screenRect.left, Math.min(newLeft, screenRect.left + screenRect.width - windowRect.width));
            newTop = Math.max(screenRect.top, Math.min(newTop, screenRect.top + screenRect.height - windowRect.height));

            terminalWindow.style.left = `${newLeft - screenRect.left}px`;
            terminalWindow.style.top = `${newTop - screenRect.top}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            terminalWindow.style.cursor = '';
        }
    });

    // --- HELPER FOR CASE INSENSITIVE FILE FINDING ---
    // This ensures "cat aşk.txt" finds "Aşk.txt"
    const findPoemKey = (inputName) => {
        return Object.keys(poems).find(key => key.toLowerCase() === inputName.toLowerCase());
    };

    // --- COMMAND INPUT HANDLER ---
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            terminalInput.value = '';

            if (command) {
                addOutput(command, true);
                
                // === MODE 1: POEMS DIRECTORY ===
                if (currentDirectory === '~/poems') {
                    // Try to find if the user typed a poem name directly (e.g. "ask.txt")
                    const directPoemKey = findPoemKey(command);

                    if (command === 'ls') {
                        addOutput("Available poems:");
                        Object.keys(poems).forEach(title => {
                            addOutput(`  ${title}`);
                        });
                    } 
                    else if (command === 'cd ..' || command === 'cd' || command === 'cd ~') {
                        currentDirectory = '~';
                        promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
                        addOutput("Returned to home directory.");
                    } 
                    else if (command === 'help') {
                        addOutput("Poem Directory Commands:");
                        addOutput("  ls        - List available poems");
                        addOutput("  cat [file]- Read a poem (e.g. 'cat Aşk.txt')");
                        addOutput("  cd ..     - Go back to home");
                    } 
                    // Handle "cat filename"
                    else if (command.startsWith('cat ')) {
                        const fileName = command.replace('cat ', '').trim();
                        const poemKey = findPoemKey(fileName);
                        
                        if (poemKey) {
                            addOutput(`Reading ${poemKey}...`);
                            addOutput("--------------------------");
                            addOutput(poems[poemKey]);
                            addOutput("--------------------------");
                        } else {
                            addOutput(`File not found: ${fileName}`);
                        }
                    }
                    // Handle just typing the filename without 'cat'
                    else if (directPoemKey) {
                        addOutput(`Reading ${directPoemKey}...`);
                        addOutput("--------------------------");
                        addOutput(poems[directPoemKey]);
                        addOutput("--------------------------");
                    } 
                    else {
                        addOutput(`Command not found: ${command}`);
                        addOutput(`Type 'ls' to see list, or 'cd ..' to exit.`);
                    }
                } 
                
                // === MODE 2: HOME DIRECTORY ===
                else {
                    if (command === 'help') {
                        addOutput("Available commands:");
                        addOutput("  ls       - List files and directories");
                        addOutput("  cd poems - Enter poems directory");
                        addOutput("  greeting - Show welcome art");
                        addOutput("  contact  - Show contact information");
                        addOutput("  cv       - Download my CV/Resume");
                        addOutput("  clear    - Clear the terminal");
                    } 
                    else if (command === 'ls') {
                        addOutput(`files: ${rootFiles.join('  ')}`);
                    }
                    else if (command === 'clear') {
                        terminalOutput.innerHTML = '';
                    } 
                    else if (command === 'greeting') {
                        addGreetingOutput(greetingArt);
                    } 
                    // Navigation to Poems
                    else if (command === 'cd poems' || command === 'poems') {
                        currentDirectory = '~/poems';
                        promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
                        addOutput("Directory changed to ~/poems");
                        addOutput("Type 'ls' to see my poems.");
                        addOutput("Type 'cat [filename]' to read one.");
                        addOutput("Type 'cd ..' to go back.");
                    } 
                    else if (command === 'contact') {
                        const contactButtons = document.createElement('div');
                        contactButtons.className = 'contact-buttons';
                        contactButtons.innerHTML = `
                            <a href="https://github.com/cankucukyilmaz" target="_blank" class="contact-btn github">
                                <i class="fab fa-github"></i> <span> GitHub </span>
                            </a>
                            <a href="https://www.instagram.com/kucukyilmaz.can/" target="_blank" class="contact-btn instagram">
                                <i class="fab fa-instagram"></i> <span> Instagram</span>
                            </a>
                            <a href="https://leetcode.com/u/canthecomputerscientist/" target="_blank" class="contact-btn leetcode">
                                <i class="fas fa-code"></i> <span> LeetCode</span>
                            </a>
                            <a href="https://www.linkedin.com/in/can-kucukyilmaz/" target="_blank" class="contact-btn linkedin">
                                <i class="fab fa-linkedin"></i> <span> LinkedIn </span>
                            </a>
                        `;
                        addOutput("Here's how you can reach me:");
                        addOutput(contactButtons);
                    } 
                    else if (command === 'cv') {
                        addOutput("Preparing CV download...", false);
                        setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = 'src/CV_Can_Kucukyilmaz.pdf';
                            link.download = 'Can_Kucukyilmaz.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            addOutput("✓ CV download started. Check your downloads folder.", false);
                        }, 800);
                    } 
                    else {
                        addOutput(`Command not found: ${command}`);
                    }
                }
            }
        }
    });

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    terminalWindow.appendChild(resizeHandle);

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
        if (isMaximized) return;
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(terminalWindow).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(terminalWindow).height, 10);
        startLeft = parseInt(document.defaultView.getComputedStyle(terminalWindow).left, 10);
        startTop = parseInt(document.defaultView.getComputedStyle(terminalWindow).top, 10);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing && !isMaximized) {
            const screenRect = document.querySelector('.screen').getBoundingClientRect();
            const windowRect = terminalWindow.getBoundingClientRect();
            const minWidth = 300;
            const minHeight = 200;
            
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);
    
            newWidth = Math.max(minWidth, newWidth);
            newHeight = Math.max(minHeight, newHeight);
            const maxWidth = screenRect.width - windowRect.left;
            const maxHeight = screenRect.height - windowRect.top;
            newWidth = Math.min(newWidth, maxWidth);
            newHeight = Math.min(newHeight, maxHeight);
    
            terminalWindow.style.width = `${newWidth}px`;
            terminalWindow.style.height = `${newHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

    function updateLastLogin() {
        const now = new Date();
        lastLoginTime = now.toLocaleString();
    }
});