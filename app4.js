 // Get references to the HTML elements
        const folderInput = document.getElementById('folder-input');
        const fileList = document.getElementById('file-list');
        const textPreview = document.getElementById('text-preview');
        const imagePreview = document.getElementById('image-preview');
        const placeholderMessage = document.getElementById('placeholder-message');
        const sendButton = document.getElementById('send-button');
        const statusMessage = document.getElementById('status-message');
        const emailAddressInput = document.getElementById('email-address-input');
        
        let selectedFile = null; // Variable to hold the currently selected file object
        let selectedFileContent = null; // Variable to hold the content of the currently selected file

        // Function to show the text preview area and hide the image preview
        function showTextPreview(content) {
            textPreview.textContent = content;
            textPreview.classList.remove('hidden');
            imagePreview.classList.add('hidden');
            placeholderMessage.classList.add('hidden');
        }

        // Function to show the image preview and hide the text preview
        function showImagePreview(src) {
            imagePreview.src = src;
            imagePreview.classList.remove('hidden');
            textPreview.classList.add('hidden');
            placeholderMessage.classList.add('hidden');
        }

        // Function to show the placeholder message
        function showPlaceholder(message) {
            placeholderMessage.textContent = message;
            placeholderMessage.classList.remove('hidden');
            textPreview.classList.add('hidden');
            imagePreview.classList.add('hidden');
        }
        
        // Function to check if the send button should be enabled
        function updateSendButtonState() {
            const hasFile = selectedFile !== null;
            const hasEmail = emailAddressInput.value.trim() !== '';
            sendButton.disabled = !(hasFile && hasEmail);
        }

        // Add an event listener to the file input to detect when a folder is selected
        folderInput.addEventListener('change', (event) => {
            // Clear previous lists and content
            fileList.innerHTML = '';
            showPlaceholder('Click on a file to view its content.');
            statusMessage.textContent = 'Status: Awaiting file and email address.';
            selectedFile = null;
            selectedFileContent = null;
            updateSendButtonState();

            // Get the list of files from the selected folder
            const files = event.target.files;

            if (files.length === 0) {
                fileList.innerHTML = '<li class="text-slate-400">No files selected.</li>';
                return;
            }

            // Loop through each file in the folder
            Array.from(files).forEach(file => {
                // Create a list item for each file
                const li = document.createElement('li');
                
                // Add styling and event listener to the list item
                li.className = 'cursor-pointer p-2 rounded-md transition-colors duration-200 hover:bg-slate-200';
                li.textContent = file.webkitRelativePath; // Show the file's path
                
                // When a file name is clicked, read its content
                li.addEventListener('click', () => {
                    selectedFile = file; // Store the file object
                    const reader = new FileReader();

                    // Check if the file is a text file
                    if (file.type.startsWith('text/') || file.type === 'application/json' || file.name.endsWith('.txt') || file.name.endsWith('.log')) {
                        reader.onload = (e) => {
                            selectedFileContent = e.target.result; // Store the content
                            showTextPreview(selectedFileContent);
                            updateSendButtonState(); // Check if button should be enabled
                            statusMessage.textContent = `Status: File '${file.webkitRelativePath}' loaded. Ready to send.`;
                        };
                        reader.readAsText(file);
                    } 
                    // Check if the file is an image file
                    else if (file.type.startsWith('image/')) {
                        reader.onload = (e) => {
                            selectedFileContent = e.target.result; // Store the base64 URL
                            showImagePreview(selectedFileContent);
                            updateSendButtonState(); // Check if button should be enabled
                            statusMessage.textContent = `Status: Image '${file.webkitRelativePath}' loaded. Ready to send.`;
                        };
                        reader.readAsDataURL(file);
                    }
                    else {
                        // Display a message for other file types
                        showPlaceholder(`Cannot display content for this file type: ${file.name}`);
                        selectedFile = null; // Clear the selected file
                        selectedFileContent = null; // Clear the selected file content
                        updateSendButtonState(); // Disable the send button
                        statusMessage.textContent = `Status: Cannot send this file type.`;
                    }
                });

                fileList.appendChild(li);
            });
        });

        // Add an event listener to the email address input
        emailAddressInput.addEventListener('input', () => {
            updateSendButtonState();
        });

        // Add an event listener to the new "Send" button
        sendButton.addEventListener('click', () => {
            const emailAddress = emailAddressInput.value.trim();
            if (selectedFile && emailAddress) {
                // The body of the email will be populated with the file content, if it's text.
                let emailBody = 'File content could not be attached directly from the browser.';
                let subject = `File from Folder Importer: ${selectedFile.name}`;

                if (selectedFileContent && !selectedFileContent.startsWith('data:image/')) {
                    emailBody = `Hello,\n\nHere is the content from the file "${selectedFile.name}":\n\n${selectedFileContent}`;
                }

                // Construct the mailto URL
                const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
                
                // Simulate a network send by opening the mailto link
                statusMessage.innerHTML = `Status: Opening email client to send to <span class="font-semibold">${emailAddress}</span>...`;
                sendButton.disabled = true;

                // Open the user's default email client
                window.location.href = mailtoUrl;

                // Reset the button state after a short delay
                setTimeout(() => {
                    statusMessage.innerHTML = `<span class="text-emerald-600 font-semibold">Status: Email client opened!</span><br>Check your email client to send the message.`;
                    sendButton.disabled = false;
                }, 2000); // Simulate a 2-second delay
            }
        });