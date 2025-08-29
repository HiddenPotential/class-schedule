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
        
        // Custom color picker
        document.getElementById('apply-custom-color').addEventListener('click', () => {
            this.applyCustomColor();
        });
        
        // PDF download
        document.getElementById('download-pdf').addEventListener('click', () => {
            this.generatePDF();
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
        
        // Cell editing enhancements
        document.querySelectorAll('.class-cell').forEach(cell => {
            cell.addEventListener('focus', this.handleCellFocus);
            cell.addEventListener('blur', this.handleCellBlur);
            cell.addEventListener('input', this.handleCellInput);
        });
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
    }
    
    applyFont(fontFamily) {
        this.table.style.fontFamily = fontFamily;
        this.currentFont = fontFamily;
    }
    
    applyFontSize(size) {
        // Remove existing font size classes
        this.canvas.classList.remove('font-small', 'font-medium', 'font-large');
        
        // Add new font size class
        this.canvas.classList.add(`font-${size}`);
        this.currentFontSize = size;
    }
    
    handleBackgroundUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.backgroundImage = e.target.result;
                this.canvasBackground.style.backgroundImage = `url(${this.backgroundImage})`;
                document.getElementById('remove-background').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
    
    removeBackground() {
        this.backgroundImage = null;
        this.canvasBackground.style.backgroundImage = 'none';
        document.getElementById('remove-background').style.display = 'none';
        document.getElementById('background-upload').value = '';
    }
    
    applyCustomColor() {
        const colorPicker = document.getElementById('custom-color-picker');
        const customColor = colorPicker.value;
        
        // Store the custom color
        this.customColor = customColor;
        
        // Remove active class from all theme options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Apply custom color to schedule text
        this.applyTheme('custom');
        
        // Show feedback message
        this.showMessage('Custom color applied!', 'success');
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
                    // Add background image to PDF
                    // Scale image to fit Letter size (8.5 x 11 inches)
                    doc.addImage(this.backgroundImage, 'JPEG', 0, 0, 8.5, 11);
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
        headerRow.appendChild(newHeader);
        
        // Add cells to each body row
        bodyRows.forEach(row => {
            const newCell = document.createElement('td');
            newCell.contentEditable = 'true';
            newCell.className = 'class-cell';
            newCell.setAttribute('data-placeholder', 'Click to add class');
            newCell.addEventListener('focus', this.handleCellFocus);
            newCell.addEventListener('blur', this.handleCellBlur);
            newCell.addEventListener('input', this.handleCellInput);
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
        newRow.appendChild(timeCell);
        
        // Add class cells for each day column
        for (let i = 1; i < columnCount; i++) {
            const classCell = document.createElement('td');
            classCell.contentEditable = 'true';
            classCell.className = 'class-cell';
            classCell.setAttribute('data-placeholder', 'Click to add class');
            classCell.addEventListener('focus', this.handleCellFocus);
            classCell.addEventListener('blur', this.handleCellBlur);
            classCell.addEventListener('input', this.handleCellInput);
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
            'classic': [44, 62, 80],
            'modern': [52, 73, 94],
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
    new ScheduleApp();
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
    // Ctrl/Cmd + P for PDF download
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
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
    const tableData = {};
    document.querySelectorAll('.class-cell').forEach((cell, index) => {
        tableData[index] = cell.textContent;
    });
    
    const appState = {
        tableData,
        theme: document.querySelector('.theme-option.active')?.dataset.theme || 'classic',
        fontFamily: document.getElementById('font-family').value,
        fontSize: document.getElementById('font-size').value
    };
    
    localStorage.setItem('scheduleAppState', JSON.stringify(appState));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('scheduleAppState');
    if (saved) {
        try {
            const appState = JSON.parse(saved);
            
            // Restore table data
            if (appState.tableData) {
                document.querySelectorAll('.class-cell').forEach((cell, index) => {
                    if (appState.tableData[index]) {
                        cell.textContent = appState.tableData[index];
                        cell.classList.remove('empty');
                    }
                });
            }
            
            // Restore theme
            if (appState.theme) {
                document.querySelector(`[data-theme="${appState.theme}"]`)?.click();
            }
            
            // Restore font settings
            if (appState.fontFamily) {
                document.getElementById('font-family').value = appState.fontFamily;
                document.getElementById('font-family').dispatchEvent(new Event('change'));
            }
            
            if (appState.fontSize) {
                document.getElementById('font-size').value = appState.fontSize;
                document.getElementById('font-size').dispatchEvent(new Event('change'));
            }
        } catch (e) {
            console.warn('Could not load saved state:', e);
        }
    }
}

// Auto-save on changes
document.addEventListener('input', () => {
    setTimeout(saveToLocalStorage, 500); // Debounce saves
});

document.addEventListener('change', saveToLocalStorage);

// Load saved state on page load
window.addEventListener('load', loadFromLocalStorage);

// Add beforeunload warning if there's unsaved content
window.addEventListener('beforeunload', (e) => {
    const hasContent = Array.from(document.querySelectorAll('.class-cell'))
        .some(cell => cell.textContent.trim());
    
    if (hasContent) {
        e.preventDefault();
        e.returnValue = '';
    }
});