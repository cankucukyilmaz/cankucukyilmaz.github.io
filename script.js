document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.querySelector('.terminal .output');
    const openTerminalBtn = document.getElementById('open-terminal-btn');
    const terminalWindow = document.getElementById('terminal-window'); // Fixed ID (was 'temrinal-window')
    const closeButton = terminalWindow.querySelector('.close');
    const minimizeButton = terminalWindow.querySelector('.minimize');
    const expandButton = terminalWindow.querySelector('.expand');
    let isDragging = false;
    let offsetX, offsetY;
    let isMaximized = false;
    let originalSize = { width: '600px', height: '400px', top: '50px', left: '50px' };
    let clickCount = 0;
    let lastLoginTime = null;
    let isMinimized = false;
    let isFirstOpen = true;

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
                    line.textContent = `user@portfolio:~$ ${lineText}`;
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
            // Restore to original size
            terminalWindow.style.width = originalSize.width;
            terminalWindow.style.height = originalSize.height;
            terminalWindow.style.top = originalSize.top;
            terminalWindow.style.left = originalSize.left;
            terminalWindow.classList.remove('maximized');
        } else {
            // Save original size before maximizing
            originalSize = {
                width: terminalWindow.style.width,
                height: terminalWindow.style.height,
                top: terminalWindow.style.top,
                left: terminalWindow.style.left
            };
            
            // Maximize to fill most of screen
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

            // Constrain to screen boundaries
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

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase(); // Convert to lowercase here
            terminalInput.value = '';
    
            if (command) {
                addOutput(command, true);
    
                if (command === 'help') {
                    addOutput("Available commands:");
                    addOutput("help - Show available commands");
                    addOutput("clear - Clear the terminal");
                    addOutput("greeting - Show welcome art");
                    addOutput("contact - Show contact information");
                    addOutput("cv - Download my CV/Resume");
                } else if (command === 'clear') {
                    terminalOutput.innerHTML = '';
                } else if (command === 'greeting') {
                    addGreetingOutput(greetingArt);
                } else if (command === 'contact') {
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
                    const contactContainer = document.createElement('div');
                    contactContainer.className = 'contact-info';
                    addOutput("Here's how you can reach me:");
                    addOutput(contactButtons);
                } else if (command === 'cv') {
                    addOutput("Preparing CV download...", false);
                    setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = 'src/CV_Can_Kucukyilmaz.pdf';
                        link.download = 'Can_Kucukyilmaz.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        addOutput("✓ CV download started. Check your downloads folder.", false);
                    }, 800); // Small delay for better UX
                } else {
                    addOutput(`Command not found: ${command}`);
                }
            }
        }
    });

    // Resize functionality
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
            
            // Calculate new width based on mouse movement
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);
    
            // Apply minimum size constraints
            newWidth = Math.max(minWidth, newWidth);
            newHeight = Math.max(minHeight, newHeight);
    
            // Calculate maximum allowed dimensions
            const maxWidth = screenRect.width - windowRect.left;
            const maxHeight = screenRect.height - windowRect.top;
    
            // Constrain to screen boundaries
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