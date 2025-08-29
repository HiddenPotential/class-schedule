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
        
        // Add active class to selected theme
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        // Apply theme to canvas
        this.canvas.setAttribute('data-theme', themeName);
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
            // Create new jsPDF instance with Letter format
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });
            
            // Get table data
            const tableData = this.extractTableData();
            
            // Set up styling based on current theme and font
            const styles = this.getPDFStyles();
            
            // Add background if exists
            if (this.backgroundImage) {
                try {
                    doc.addImage(this.backgroundImage, 'JPEG', 0, 0, 8.5, 11, undefined, 'FAST');
                } catch (e) {
                    console.warn('Could not add background image to PDF:', e);
                }
            }
            
            // Create the table using autoTable
            doc.autoTable({
                head: [tableData.headers],
                body: tableData.rows,
                startY: 0.5,
                margin: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
                tableWidth: 7.5,
                styles: {
                    fontSize: styles.fontSize,
                    fontStyle: 'normal',
                    textColor: styles.textColor,
                    fillColor: styles.fillColor,
                    lineColor: styles.lineColor,
                    lineWidth: 0.01,
                    cellPadding: 0.05,
                    font: 'helvetica'
                },
                headStyles: {
                    fillColor: styles.headerFillColor,
                    textColor: styles.headerTextColor,
                    fontStyle: 'bold',
                    fontSize: styles.headerFontSize
                },
                columnStyles: {
                    0: { cellWidth: 0.9, halign: 'center' }, // Time column
                    1: { cellWidth: 1.32, halign: 'center' }, // Monday
                    2: { cellWidth: 1.32, halign: 'center' }, // Tuesday
                    3: { cellWidth: 1.32, halign: 'center' }, // Wednesday
                    4: { cellWidth: 1.32, halign: 'center' }, // Thursday
                    5: { cellWidth: 1.32, halign: 'center' }  // Friday
                },
                alternateRowStyles: {
                    fillColor: styles.alternateRowColor
                },
                didParseCell: function(data) {
                    // Ensure text fits within cells
                    if (data.cell.text && data.cell.text.length > 0) {
                        const maxLength = data.column.index === 0 ? 8 : 15;
                        if (data.cell.text[0].length > maxLength) {
                            data.cell.text[0] = data.cell.text[0].substring(0, maxLength - 3) + '...';
                        }
                    }
                }
            });
            
            // Save the PDF
            const fileName = `class-schedule-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            // Show success message
            this.showMessage('PDF downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showMessage('Error generating PDF. Please try again.', 'error');
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