// Class Schedule Styling App - Main JavaScript

class ScheduleApp {
    constructor() {
        this.canvas = document.getElementById('schedule-canvas');
        this.table = document.getElementById('schedule-table');
        this.canvasBackground = document.querySelector('.canvas-background');
        this.currentTheme = 'classic';
        this.currentFont = 'Arial, sans-serif';
        this.currentFontSize = 'medium';
        this.backgroundImage = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupPlaceholders();
        this.applyTheme(this.currentTheme);
    }
    
    setupEventListeners() {
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.applyTheme(theme);
            });
        });
        
        // Font family selection
        document.getElementById('font-family').addEventListener('change', (e) => {
            this.applyFont(e.target.value);
        });
        
        // Font size selection
        document.getElementById('font-size').addEventListener('change', (e) => {
            this.applyFontSize(e.target.value);
        });
        
        // Background upload
        document.getElementById('background-btn').addEventListener('click', () => {
            document.getElementById('background-upload').click();
        });
        
        document.getElementById('background-upload').addEventListener('change', (e) => {
            this.handleBackgroundUpload(e);
        });
        
        // Remove background
        document.getElementById('remove-background').addEventListener('click', () => {
            this.removeBackground();
        });
        
        // Background opacity control
        document.getElementById('background-opacity').addEventListener('input', (e) => {
            this.updateBackgroundOpacity(e.target.value);
        });
        
        // Custom color picker
        document.getElementById('apply-custom-color').addEventListener('click', () => {
            this.applyCustomColor();
        });
        
        // Download PDF button
        document.getElementById('download-pdf').addEventListener('click', () => {
            this.generatePDF();
        });
        
        // Print button
        document.getElementById('print-schedule').addEventListener('click', () => {
            this.printSchedule();
        });
        
        // Table structure controls
        document.getElementById('add-column').addEventListener('click', () => {
            this.addColumn();
        });
        
        document.getElementById('remove-column').addEventListener('click', () => {
            this.removeColumn();
        });
        
        document.getElementById('add-row').addEventListener('click', () => {
            this.addRow();
        });
        
        document.getElementById('remove-row').addEventListener('click', () => {
            this.removeRow();
        });
        
        // Cell editing enhancements using event delegation
        document.addEventListener('focus', (e) => {
            if (e.target.classList.contains('class-cell')) {
                this.handleCellFocus(e);
            }
        }, true);
        
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('class-cell')) {
                this.handleCellBlur(e);
            }
        }, true);
        
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('class-cell')) {
                this.handleCellInput(e);
            }
        }, true);
        
        // Use event delegation for paste events on all contenteditable elements
        document.addEventListener('paste', (e) => {
            if (e.target.contentEditable === 'true') {
                this.handleCellPaste(e);
            }
        }, true);
    }
    
    setupPlaceholders() {
        // Enhanced placeholder behavior for contenteditable cells
        document.querySelectorAll('.class-cell').forEach(cell => {
            if (!cell.textContent.trim()) {
                cell.classList.add('empty');
            }
        });
    }
    
    applyTheme(themeName) {
        // Remove active class from all theme options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to selected theme (skip for custom)
        if (themeName !== 'custom') {
            const themeElement = document.querySelector(`[data-theme="${themeName}"]`);
            if (themeElement) {
                themeElement.classList.add('active');
            }
        }
        
        // Apply theme to canvas, title, and table
        this.canvas.setAttribute('data-theme', themeName);
        this.table.setAttribute('data-theme', themeName);
        const title = document.getElementById('schedule-title');
        if (title) {
            title.setAttribute('data-theme', themeName);
        }
        
        // Apply custom color if it's a custom theme
        if (themeName === 'custom' && this.customColor) {
            document.documentElement.style.setProperty('--custom-text-color', this.customColor);
            this.canvas.style.setProperty('--theme-color', this.customColor);
        }
        
        this.currentTheme = themeName;
        
        // Trigger autosave
        setTimeout(saveToLocalStorage, 100);
    }
    
    applyFont(fontFamily) {
        this.table.style.fontFamily = fontFamily;
        this.currentFont = fontFamily;
        
        // Trigger autosave
        setTimeout(saveToLocalStorage, 100);
    }
    
    applyFontSize(size) {
        // Remove existing font size classes
        this.canvas.classList.remove('font-small', 'font-medium', 'font-large');
        
        // Add new font size class
        this.canvas.classList.add(`font-${size}`);
        this.currentFontSize = size;
        
        // Trigger autosave
        setTimeout(saveToLocalStorage, 100);
    }
    
    handleBackgroundUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.backgroundImage = e.target.result;
                this.canvasBackground.style.backgroundImage = `url(${this.backgroundImage})`;
                // Set initial opacity from slider value
                const opacityValue = document.getElementById('background-opacity').value;
                this.canvasBackground.style.opacity = opacityValue / 100;
                document.getElementById('remove-background').style.display = 'block';
                document.getElementById('transparency-control').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
    
    removeBackground() {
        this.backgroundImage = null;
        this.canvasBackground.style.backgroundImage = 'none';
        this.canvasBackground.style.opacity = 0.1; // Reset to default
        document.getElementById('remove-background').style.display = 'none';
        document.getElementById('transparency-control').style.display = 'none';
        document.getElementById('background-upload').value = '';
    }
    
    updateBackgroundOpacity(value) {
        const opacity = value / 100;
        this.canvasBackground.style.opacity = opacity;
        document.getElementById('opacity-value').textContent = `${value}%`;
    }
    
    applyCustomColor() {
        const colorPicker = document.getElementById('custom-color-picker');
        const customColor = colorPicker.value;
        
        // Store the custom color
        this.customColor = customColor;
        
        // Check if there's selected text
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            // Apply color to selected text only
            this.applyColorToSelection(customColor);
            this.showMessage('Custom color applied to selected text!', 'success');
        } else {
            // Remove active class from all theme options
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('active');
            });
            
            // Apply custom color to entire schedule
            this.applyTheme('custom');
            this.showMessage('Custom color applied to entire schedule!', 'success');
        }
        
        // Trigger autosave
        setTimeout(saveToLocalStorage, 100);
    }

    applyColorToSelection(color) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            return;
        }

        try {
            // Get the selected range
            const range = selection.getRangeAt(0);
            
            // Check if selection is within a contenteditable element
            const container = range.commonAncestorContainer;
            const editableElement = container.nodeType === Node.TEXT_NODE 
                ? container.parentElement 
                : container;
            
            if (!editableElement.closest('[contenteditable="true"]')) {
                this.showMessage('Please select text within an editable cell', 'error');
                return;
            }

            // Create a span element with the custom color
            const span = document.createElement('span');
            span.style.color = color;
            span.style.fontWeight = 'inherit';
            
            try {
                // Extract the selected content and wrap it in the colored span
                const contents = range.extractContents();
                span.appendChild(contents);
                range.insertNode(span);
                
                // Clear the selection
                selection.removeAllRanges();
                
                // Trigger input event to ensure autosave
                const cell = editableElement.closest('.class-cell, .schedule-title, .time-slot');
                if (cell) {
                    cell.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
            } catch (error) {
                console.error('Error applying color to selection:', error);
                this.showMessage('Error applying color to selected text', 'error');
            }
            
        } catch (error) {
            console.error('Selection error:', error);
            this.showMessage('Error processing text selection', 'error');
        }
    }

    handleCellFocus(event) {
        event.target.classList.remove('empty');
    }
    
    handleCellBlur(event) {
        if (!event.target.textContent.trim()) {
            event.target.classList.add('empty');
        }
    }
    
    handleCellInput(event) {
        const cell = event.target;
        if (cell.textContent.trim()) {
            cell.classList.remove('empty');
        } else {
            cell.classList.add('empty');
        }
        
        // Trigger autosave with debounce
        setTimeout(saveToLocalStorage, 500);
    }
    
    handleCellPaste(event) {
        // Prevent default paste behavior
        event.preventDefault();
        
        try {
            const clipboardData = event.clipboardData || window.clipboardData;
            
            // Try multiple clipboard formats to preserve formatting
            let htmlContent = clipboardData.getData('text/html');
            let rtfContent = clipboardData.getData('text/rtf');
            let plainText = clipboardData.getData('text/plain');
            
            console.log('Paste data:', { htmlContent, rtfContent, plainText });
            
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                
                // Try to preserve formatting from HTML content
                if (htmlContent && htmlContent.trim()) {
                    // Clean and parse HTML content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    
                    // Filter and preserve only safe formatting
                    const fragment = document.createDocumentFragment();
                    this.processNodesForPaste(tempDiv, fragment);
                    
                    if (fragment.hasChildNodes()) {
                        range.insertNode(fragment);
                    } else {
                        // Fallback to plain text if HTML processing failed
                        range.insertNode(document.createTextNode(plainText || ''));
                    }
                } else {
                    // No HTML content, use plain text
                    range.insertNode(document.createTextNode(plainText || ''));
                }
                
                // Move cursor to end of pasted content
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } catch (error) {
            console.error('Paste error:', error);
            // Fallback to plain text if anything fails
            const plainText = (event.clipboardData || window.clipboardData).getData('text/plain');
            if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, plainText);
            }
        }
        
        // Trigger input event to update cell state
        event.target.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Trigger autosave after paste
        setTimeout(saveToLocalStorage, 500);
    }
    
    processNodesForPaste(sourceNode, targetFragment) {
        for (let child of Array.from(sourceNode.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                // Preserve text nodes
                targetFragment.appendChild(document.createTextNode(child.textContent));
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // Handle specific elements that preserve formatting
                if (child.tagName === 'SPAN' && child.style.color) {
                    // Preserve colored spans
                    const span = document.createElement('span');
                    span.style.color = child.style.color;
                    span.style.fontWeight = child.style.fontWeight || 'inherit';
                    
                    // Recursively process child nodes
                    this.processNodesForPaste(child, span);
                    targetFragment.appendChild(span);
                } else if (['B', 'STRONG', 'I', 'EM', 'U'].includes(child.tagName)) {
                    // Preserve basic formatting
                    const formattedElement = document.createElement(child.tagName.toLowerCase());
                    this.processNodesForPaste(child, formattedElement);
                    targetFragment.appendChild(formattedElement);
                } else {
                    // For other elements, just extract the text content
                    this.processNodesForPaste(child, targetFragment);
                }
            }
        }
    }
    
    generatePDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            // Get current theme and font settings
            const activeThemeElement = document.querySelector('.theme-option.active');
            let currentTheme = activeThemeElement ? activeThemeElement.dataset.theme : 'default';
            
            // Check if custom color is being used
            if (this.customColor && !activeThemeElement) {
                currentTheme = 'custom';
            }
            const currentFont = document.getElementById('font-family').value;
            const fontSizeClass = document.getElementById('font-size').value;
            
            // Map font size classes to actual pixel values to match editor
            const fontSizeMap = {
                'small': 11,
                'medium': 13, 
                'large': 15
            };
            const currentFontSize = fontSizeMap[fontSizeClass] || 13;

            // Set document properties
            doc.setProperties({
                title: 'Class Schedule',
                subject: 'Weekly Class Schedule',
                author: 'Schedule App',
                creator: 'Class Schedule Styling App'
            });

            // Add background image if one is uploaded
            if (this.backgroundImage) {
                try {
                    // Get current opacity setting from slider
                    const opacitySlider = document.getElementById('background-opacity');
                    const opacity = opacitySlider ? opacitySlider.value / 100 : 0.1;
                    
                    // Set opacity for background image
                    doc.setGState(new doc.GState({opacity: opacity}));
                    
                    // Add background image to PDF
                    // Scale image to fit Letter size (8.5 x 11 inches)
                    doc.addImage(this.backgroundImage, 'JPEG', 0, 0, 8.5, 11);
                    
                    // Reset opacity to full for other elements
                    doc.setGState(new doc.GState({opacity: 1}));
                } catch (error) {
                    console.warn('Failed to add background image to PDF:', error);
                }
            }

            // Add title from the editable title element
            const titleElement = document.getElementById('schedule-title');
            const titleText = titleElement ? titleElement.textContent.trim() : 'Class Schedule';
            
            doc.setFontSize(18);
            doc.setFont(this.mapFontToPDF(currentFont), 'bold');
            
            // Apply theme color to title in PDF
            const titleColor = this.getThemeTextColor(currentTheme);
            if (titleColor) {
                doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
            }
            
            doc.text(titleText, 4.25, 0.8, { align: 'center' });
            
            // Reset text color for table
            doc.setTextColor(44, 62, 80);

            // Prepare table data
            const tableData = [];
            const headers = [];
            
            // Get headers dynamically
            const headerCells = this.table.querySelectorAll('thead th');
            headerCells.forEach(cell => {
                headers.push(cell.textContent.trim());
            });

            // Get body data dynamically
            const bodyRows = this.table.querySelectorAll('tbody tr');
            bodyRows.forEach(row => {
                const rowData = [];
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    rowData.push(cell.textContent.trim() || '');
                });
                tableData.push(rowData);
            });

            // Calculate optimal font size and column widths for PDF
            const columnCount = headers.length;
            const availableWidth = 7.5; // Letter width minus margins
            const timeColumnWidth = 0.8;
            const dayColumnWidth = (availableWidth - timeColumnWidth) / (columnCount - 1);
            
            // Use exact font sizes to match editor display
            const pdfFontSize = Math.max(8, Math.min(14, currentFontSize * 0.75));
            const headerFontSize = Math.max(9, Math.min(15, currentFontSize + 1));
            const timeSlotFontSize = Math.max(7, Math.min(13, currentFontSize - 1));

            // Prepare column styles dynamically
            const columnStyles = {
                0: { 
                    cellWidth: timeColumnWidth,
                    fillColor: [236, 240, 241],
                    fontStyle: 'bold'
                }
            };
            
            // Set width for day columns and time column font size
            columnStyles[0].fontSize = timeSlotFontSize;
            for (let i = 1; i < columnCount; i++) {
                columnStyles[i] = {
                    cellWidth: dayColumnWidth
                };
            }

            // Get theme text color for table content
            const themeTextColor = this.getThemeTextColor(currentTheme);
            
            // Generate table with autoTable
            doc.autoTable({
                head: [headers],
                body: tableData,
                startY: 1.2,
                margin: { top: 1.2, right: 0.5, bottom: 0.5, left: 0.5 },
                pageBreak: 'avoid',
                tableWidth: 'auto',
                styles: {
                    fontSize: pdfFontSize,
                    cellPadding: 0.06,
                    font: this.mapFontToPDF(currentFont),
                    textColor: themeTextColor,
                    lineColor: [221, 221, 221],
                    lineWidth: 0.01,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: {
                    fillColor: [248, 249, 250],
                    textColor: themeTextColor,
                    fontStyle: 'bold',
                    fontSize: headerFontSize
                },
                columnStyles: columnStyles,
                alternateRowStyles: {
                    fillColor: [252, 252, 252]
                },
                didDrawPage: function(data) {
                    // Ensure content fits on single page
                    if (data.pageNumber > 1) {
                        console.warn('Content exceeds single page');
                    }
                },
                didParseCell: function(data) {
                    // Adjust font size if table is too wide
                    if (columnCount > 7 && data.cell.styles.fontSize > 8) {
                        data.cell.styles.fontSize = 8;
                    }
                    // Apply theme color to all cells
                    data.cell.styles.textColor = themeTextColor;
                }
            });

            // Apply theme colors if not default
            if (currentTheme !== 'default') {
                const themeColors = this.getThemeTextColor(currentTheme);
                // Note: Advanced theming would require more complex jsPDF customization
            }

            // Save the PDF
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            doc.save(`class-schedule-${timestamp}.pdf`);
            
            this.showMessage('PDF generated successfully!', 'success');
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            this.showMessage('Failed to generate PDF. Please try again.', 'error');
        }
    }
    
    printSchedule() {
        try {
            // Add print styles to current document
            this.addPrintStyles();
            
            // Hide non-essential elements
            const elementsToHide = document.querySelectorAll('.control-panel, .product-header, button:not(.print-btn), .background-controls, .table-controls');
            elementsToHide.forEach(el => el.style.display = 'none');
            
            // Trigger browser print
            window.print();
            
            // Restore hidden elements after print
            setTimeout(() => {
                elementsToHide.forEach(el => el.style.display = '');
            }, 1000);
            

            
        } catch (error) {
            console.error('Print failed:', error);
            this.showMessage('Failed to open print dialog. Please try again.', 'error');
        }
    }
    
    addPrintStyles() {
        // Remove existing print styles
        const existingPrintStyle = document.getElementById('print-styles');
        if (existingPrintStyle) {
            existingPrintStyle.remove();
        }
        
        // Add new print styles
        const printStyles = document.createElement('style');
        printStyles.id = 'print-styles';
        printStyles.innerHTML = `
            @media print {
                @page {
                    size: letter;
                    margin: 0.5in;
                }
                
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                html, body {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    background: white !important;
                    font-size: 10pt;
                }
                
                .app-container {
                    width: 100% !important;
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                .schedule-canvas {
                    width: 100% !important;
                    max-width: none !important;
                    height: auto !important;
                    box-shadow: none !important;
                    border: none !important;
                    margin: 0 !important;
                    padding: 10px !important;
                    page-break-inside: avoid;
                    background: white !important;
                }
                
                .schedule-table {
                    width: 100% !important;
                    height: auto !important;
                    border-collapse: collapse;
                    table-layout: fixed;
                    font-size: 9pt !important;
                    margin: 0;
                    page-break-inside: avoid;
                }
                
                .schedule-table th {
                    border: 1px solid #333 !important;
                    padding: 4px 3px !important;
                    font-size: 9pt !important;
                    line-height: 1.2 !important;
                    font-weight: bold;
                    text-align: center;
                    vertical-align: middle;
                    height: auto !important;
                    background: #f0f0f0 !important;
                }
                
                .schedule-table td {
                    border: 1px solid #333 !important;
                    padding: 3px 2px !important;
                    font-size: 8pt !important;
                    line-height: 1.1 !important;
                    vertical-align: top;
                    height: auto !important;
                    word-wrap: break-word;
                    overflow: visible;
                }
                
                .schedule-title {
                    text-align: center;
                    margin: 0 0 15px 0;
                    font-size: 16pt !important;
                    font-weight: bold;
                    page-break-after: avoid;
                }
                
                /* Hide non-essential elements */
                .control-panel,
                .product-header,
                button,
                .background-controls,
                .table-controls {
                    display: none !important;
                }
                
                /* Ensure no page breaks */
                .schedule-canvas,
                .schedule-table,
                .schedule-table tbody,
                .schedule-table tr {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
            }
        `;
        
        document.head.appendChild(printStyles);
    }
                            

    
    extractTableData() {
        const headers = [];
        const rows = [];
        
        // Extract headers
        const headerCells = this.table.querySelectorAll('thead th');
        headerCells.forEach(cell => {
            headers.push(cell.textContent.trim());
        });
        
        // Extract rows
        const bodyRows = this.table.querySelectorAll('tbody tr');
        bodyRows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim() || '');
            });
            rows.push(rowData);
        });
        
        return { headers, rows };
    }
    
    getPDFStyles() {
        const themeStyles = {
            classic: {
                fillColor: [255, 255, 255],
                textColor: [44, 62, 80],
                lineColor: [221, 221, 221],
                headerFillColor: [248, 249, 250],
                headerTextColor: [44, 62, 80],
                alternateRowColor: [248, 249, 250]
            },
            blue: {
                fillColor: [227, 242, 253],
                textColor: [21, 101, 192],
                lineColor: [144, 202, 249],
                headerFillColor: [187, 222, 251],
                headerTextColor: [21, 101, 192],
                alternateRowColor: [187, 222, 251]
            },
            green: {
                fillColor: [232, 245, 232],
                textColor: [46, 125, 50],
                lineColor: [165, 214, 167],
                headerFillColor: [200, 230, 201],
                headerTextColor: [46, 125, 50],
                alternateRowColor: [200, 230, 201]
            },
            purple: {
                fillColor: [243, 229, 245],
                textColor: [123, 31, 162],
                lineColor: [206, 147, 216],
                headerFillColor: [225, 190, 231],
                headerTextColor: [123, 31, 162],
                alternateRowColor: [225, 190, 231]
            },
            orange: {
                fillColor: [255, 243, 224],
                textColor: [239, 108, 0],
                lineColor: [255, 183, 77],
                headerFillColor: [255, 204, 128],
                headerTextColor: [239, 108, 0],
                alternateRowColor: [255, 204, 128]
            },
            dark: {
                fillColor: [66, 66, 66],
                textColor: [255, 255, 255],
                lineColor: [117, 117, 117],
                headerFillColor: [97, 97, 97],
                headerTextColor: [255, 255, 255],
                alternateRowColor: [97, 97, 97]
            }
        };
        
        const fontSizes = {
            small: { fontSize: 8, headerFontSize: 9 },
            medium: { fontSize: 10, headerFontSize: 11 },
            large: { fontSize: 12, headerFontSize: 13 }
        };
        
        return {
            ...themeStyles[this.currentTheme],
            ...fontSizes[this.currentFontSize]
        };
    }
    
    addColumn() {
        const headerRow = this.table.querySelector('thead tr');
        const bodyRows = this.table.querySelectorAll('tbody tr');
        
        // Add header cell
        const newHeader = document.createElement('th');
        newHeader.contentEditable = 'true';
        newHeader.textContent = `Day ${headerRow.children.length}`;
        // Event listeners are now handled by event delegation
        headerRow.appendChild(newHeader);
        
        // Add cells to each body row
        bodyRows.forEach(row => {
            const newCell = document.createElement('td');
            newCell.contentEditable = 'true';
            newCell.className = 'class-cell';
            newCell.setAttribute('data-placeholder', 'Click to add class');
            // Event listeners are now handled by event delegation
            row.appendChild(newCell);
        });
        
        this.showMessage('Column added successfully!', 'success');
        this.updateColumnWidths();
    }
    
    removeColumn() {
        const headerRow = this.table.querySelector('thead tr');
        const bodyRows = this.table.querySelectorAll('tbody tr');
        
        // Don't remove if only time column and one day column remain
        if (headerRow.children.length <= 2) {
            this.showMessage('Cannot remove column. At least one day column is required.', 'error');
            return;
        }
        
        // Remove last header cell (not the time column)
        headerRow.removeChild(headerRow.lastElementChild);
        
        // Remove last cell from each body row
        bodyRows.forEach(row => {
            row.removeChild(row.lastElementChild);
        });
        
        this.showMessage('Column removed successfully!', 'success');
        this.updateColumnWidths();
    }
    
    addRow() {
        const tbody = this.table.querySelector('tbody');
        const headerRow = this.table.querySelector('thead tr');
        const columnCount = headerRow.children.length;
        
        // Generate next time slot
        const existingRows = tbody.querySelectorAll('tr');
        const lastTimeSlot = existingRows[existingRows.length - 1].querySelector('.time-slot').textContent;
        const nextTime = this.getNextTimeSlot(lastTimeSlot);
        
        // Create new row
        const newRow = document.createElement('tr');
        
        // Add time slot cell
        const timeCell = document.createElement('td');
        timeCell.className = 'time-slot';
        timeCell.contentEditable = 'true';
        timeCell.textContent = nextTime;
        // Event listeners are now handled by event delegation
        newRow.appendChild(timeCell);
        
        // Add class cells for each day column
        for (let i = 1; i < columnCount; i++) {
            const classCell = document.createElement('td');
            classCell.contentEditable = 'true';
            classCell.className = 'class-cell';
            classCell.setAttribute('data-placeholder', 'Click to add class');
            // Event listeners are now handled by event delegation
            newRow.appendChild(classCell);
        }
        
        tbody.appendChild(newRow);
        this.showMessage('Row added successfully!', 'success');
    }
    
    removeRow() {
        const tbody = this.table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        // Don't remove if only one row remains
        if (rows.length <= 1) {
            this.showMessage('Cannot remove row. At least one time slot is required.', 'error');
            return;
        }
        
        // Remove last row
        tbody.removeChild(tbody.lastElementChild);
        this.showMessage('Row removed successfully!', 'success');
    }
    
    getNextTimeSlot(currentTime) {
        // Parse current time and add 1 hour
        const timeMatch = currentTime.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (!timeMatch) return '6:00 PM';
        
        let hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        let period = timeMatch[3];
        
        hour += 1;
        
        if (hour === 12 && period === 'AM') {
            period = 'PM';
        } else if (hour === 13 && period === 'PM') {
            hour = 1;
        } else if (hour === 12 && period === 'PM') {
            hour = 1;
            period = 'AM';
        }
        
        return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
    
    updateColumnWidths() {
        // Recalculate column widths based on number of columns
        const headerRow = this.table.querySelector('thead tr');
        const columnCount = headerRow.children.length;
        const dayColumnWidth = Math.floor((100 - 12) / (columnCount - 1)); // 12% for time column
        
        // Update CSS custom property for dynamic width
        document.documentElement.style.setProperty('--day-column-width', `${dayColumnWidth}%`);
    }
    
    getThemeTextColor(theme) {
        const themeColors = {
            'default': [44, 62, 80],
            'classic': [139, 69, 19],
            'modern': [70, 130, 180],
            'vibrant': [155, 89, 182],
            'nature': [39, 174, 96],
            'sunset': [230, 126, 34]
        };
        
        if (theme === 'custom' && this.customColor) {
            return this.hexToRgb(this.customColor);
        }
        
        return themeColors[theme] || [44, 62, 80];
    }
    
    hexToRgb(hex) {
        // Convert hex color to RGB array
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [44, 62, 80];
    }
    
    mapFontToPDF(fontFamily) {
        // Map web fonts to PDF-compatible fonts
        const fontMap = {
            'Arial, sans-serif': 'helvetica',
            "'Inter', sans-serif": 'helvetica',
            "'Roboto', sans-serif": 'helvetica',
            "'Open Sans', sans-serif": 'helvetica',
            "'Lato', sans-serif": 'helvetica',
            "'Montserrat', sans-serif": 'helvetica',
            "'Poppins', sans-serif": 'helvetica',
            "'Source Sans Pro', sans-serif": 'helvetica',
            "'Nunito', sans-serif": 'helvetica',
            "'Raleway', sans-serif": 'helvetica',
            "'Ubuntu', sans-serif": 'helvetica',
            'Georgia, serif': 'times',
            "'Times New Roman', serif": 'times',
            "'Courier New', monospace": 'courier',
            "'Comic Sans MS', cursive": 'helvetica',
            'Helvetica, sans-serif': 'helvetica',
            'Verdana, sans-serif': 'helvetica',
            'Trebuchet MS, sans-serif': 'helvetica',
            'Impact, sans-serif': 'helvetica'
        };
        return fontMap[fontFamily] || 'helvetica';
    }
    
    showMessage(text, type = 'info') {
        // Create and show a temporary message
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transition: all 0.3s ease;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        `;
        
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleApp = new ScheduleApp();
});

// Add some utility functions for better user experience

// Prevent default drag and drop behavior on the canvas
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + P for print
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        document.getElementById('print-schedule').click();
    }
    // Ctrl/Cmd + P for PDF download
    else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        document.getElementById('download-pdf').click();
    }
    
    // Escape to blur current cell
    if (e.key === 'Escape') {
        if (document.activeElement && document.activeElement.classList.contains('class-cell')) {
            document.activeElement.blur();
        }
    }
});

// Add auto-save functionality to localStorage
function saveToLocalStorage() {
    console.log('🔄 saveToLocalStorage called');
    
    const tableData = {};
    const cells = document.querySelectorAll('.class-cell');
    console.log(`📊 Found ${cells.length} cells to save`);
    
    cells.forEach((cell, index) => {
        // Save both text content and HTML to preserve formatting
        tableData[index] = {
            text: cell.textContent || '',
            html: cell.innerHTML || ''
        };
    });
    
    // Also save title
    const title = document.getElementById('schedule-title');
    const titleText = title ? title.textContent : 'Class Schedule';
    
    // Get the app instance to access customColor
    const app = window.scheduleApp;
    const activeTheme = document.querySelector('.theme-option.active');
    const currentTheme = activeTheme ? activeTheme.dataset.theme : (app && app.customColor ? 'custom' : 'classic');
    
    const appState = {
        tableData,
        title: titleText,
        theme: currentTheme,
        customColor: app ? app.customColor : null,
        fontFamily: document.getElementById('font-family')?.value || 'Arial, sans-serif',
        fontSize: document.getElementById('font-size')?.value || 'medium',
        timestamp: new Date().toISOString()
    };
    
    console.log('💾 Saving state:', appState);
    try {
        localStorage.setItem('scheduleAppState', JSON.stringify(appState));
        console.log('✅ State saved successfully at', new Date().toLocaleTimeString());
        return true;
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
        return false;
    }
}

function showSaveIndicator() {
    // Save indicator disabled - no popup will be shown
    return;
}

function loadFromLocalStorage() {
    console.log('📂 loadFromLocalStorage called');
    const saved = localStorage.getItem('scheduleAppState');
    console.log('💽 Saved data from localStorage:', saved ? 'Found data' : 'No data');
    
    if (saved) {
        try {
            const appState = JSON.parse(saved);
            console.log('📋 Parsed state from:', appState.timestamp || 'unknown time');
            console.log('📊 State contains:', Object.keys(appState));
            
            // Restore title
            if (appState.title) {
                const titleElement = document.getElementById('schedule-title');
                if (titleElement) {
                    titleElement.textContent = appState.title;
                    console.log('📝 Title restored:', appState.title);
                }
            }
            
            // Restore table data
            if (appState.tableData) {
                const cells = document.querySelectorAll('.class-cell');
                console.log(`🔄 Restoring data to ${cells.length} cells`);
                
                cells.forEach((cell, index) => {
                    const cellData = appState.tableData[index];
                    if (cellData) {
                        // Handle both old format (string) and new format (object)
                        if (typeof cellData === 'string') {
                            // Old format - just text
                            cell.textContent = cellData;
                        } else if (cellData.html) {
                            // New format - restore HTML formatting
                            cell.innerHTML = cellData.html;
                        } else if (cellData.text) {
                            // New format but no HTML - use text
                            cell.textContent = cellData.text;
                        }
                        cell.classList.remove('empty');
                    }
                });
                console.log('✅ Table data restored');
            }
            
            // Restore theme and custom color
            if (appState.theme) {
                if (appState.theme === 'custom' && appState.customColor) {
                    // Restore custom color
                    const colorPicker = document.getElementById('custom-color-picker');
                    const app = window.scheduleApp;
                    if (colorPicker && app) {
                        colorPicker.value = appState.customColor;
                        app.customColor = appState.customColor;
                        app.applyTheme('custom');
                        console.log('🎨 Custom color restored:', appState.customColor);
                    }
                } else {
                    const themeButton = document.querySelector(`[data-theme="${appState.theme}"]`);
                    if (themeButton) {
                        themeButton.click();
                        console.log('🎨 Theme restored:', appState.theme);
                    } else {
                        console.warn('⚠️ Theme button not found for:', appState.theme);
                    }
                }
            }
            
            // Restore font settings
            if (appState.fontFamily) {
                const fontSelect = document.getElementById('font-family');
                if (fontSelect) {
                    fontSelect.value = appState.fontFamily;
                    fontSelect.dispatchEvent(new Event('change'));
                    console.log('🔤 Font family restored:', appState.fontFamily);
                }
            }
            
            if (appState.fontSize) {
                const sizeSelect = document.getElementById('font-size');
                if (sizeSelect) {
                    sizeSelect.value = appState.fontSize;
                    sizeSelect.dispatchEvent(new Event('change'));
                    console.log('📏 Font size restored:', appState.fontSize);
                }
            }
            
            console.log('🎉 Load completed successfully!');
        } catch (e) {
            console.error('❌ Could not load saved state:', e);
        }
    } else {
        console.log('📭 No saved state found - starting fresh');
    }
}

// Auto-save on changes
document.addEventListener('input', () => {
    setTimeout(saveToLocalStorage, 500); // Debounce saves
});

document.addEventListener('change', saveToLocalStorage);

// Load saved state on page load
window.addEventListener('load', loadFromLocalStorage);

// Add manual test function for debugging
window.testAutosave = function() {
    console.log('=== Manual Autosave Test ===');
    saveToLocalStorage();
    console.log('=== Manual Load Test ===');
    loadFromLocalStorage();
    console.log('=== Test Complete ===');
};

// Test button removed

// Log when page loads
console.log('Class Schedule App loaded. Type testAutosave() in console to test saving/loading.');

// Test localStorage availability immediately
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage is available and working');
} catch (error) {
    console.error('❌ localStorage is not available:', error);
}

// Test if we can find cells
setTimeout(() => {
    const cells = document.querySelectorAll('.class-cell');
    console.log(`Found ${cells.length} editable cells`);
    if (cells.length === 0) {
        console.warn('⚠️ No .class-cell elements found - this might be why autosave isn\'t working');
    }
}, 1000);

// Add beforeunload warning if there's unsaved content
window.addEventListener('beforeunload', (e) => {
    const hasContent = Array.from(document.querySelectorAll('.class-cell'))
        .some(cell => cell.textContent.trim());
    
    if (hasContent) {
        e.preventDefault();
        e.returnValue = '';
    }
});