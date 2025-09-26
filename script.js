document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('expenseForm');
    const tableBody = document.getElementById('tableBody');
    const downloadBtn = document.getElementById('downloadBtn');
    const importBtn = document.getElementById('importBtn');
    const resetBtn = document.getElementById('resetBtn');
    const importFile = document.getElementById('importFile');
    const emptyState = document.getElementById('emptyState');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // Set the initial active view
    document.getElementById('expense-view').classList.add('active');

    // Load entries from local storage when the page loads
    loadEntries();

    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const item = document.getElementById('item').value;
        const date = document.getElementById('date').value;
        const price = document.getElementById('price').value;
        const category = document.getElementById('category').value;
        const secondaryCategory = document.getElementById('secondaryCategory').value;
        const importance = document.getElementById('importance').value;
        const cycle = document.getElementById('cycle').value;
        const account = document.getElementById('account').value;
        const transferType = document.getElementById('transferType').value;
        const receiver = document.getElementById('receiver').value;

        // Create a new entry
        const entry = { item, date, price, category, secondaryCategory, importance, cycle, account, transferType, receiver };

        // Save the entry to local storage
        saveEntry(entry);

        // Add the entry to the table
        addEntryToTable(entry);

        // Reset the form
        form.reset();

        // Show success message
        showToast('Entry added successfully');
    });

    downloadBtn.addEventListener('click', function() {
        downloadCSV();
    });

    importBtn.addEventListener('click', function() {
        importFile.click();
    });

    resetBtn.addEventListener('click', function() {
        resetEntries();
    });

    importFile.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            importCSV(file);
        }
    });

    function saveEntry(entry) {
        let entries = JSON.parse(localStorage.getItem('entries')) || [];
        entries.push(entry);
        localStorage.setItem('entries', JSON.stringify(entries));
    }

    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        if (entries.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            entries.forEach(entry => addEntryToTable(entry));
        }
    }

    function addEntryToTable(entry) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.item}</td>
            <td>${entry.date}</td>
            <td>${entry.price}</td>
            <td>${entry.category}</td>
            <td>${entry.secondaryCategory}</td>
            <td>${entry.importance}</td>
            <td>${entry.cycle}</td>
            <td>${entry.account}</td>
            <td>${entry.transferType}</td>
            <td>${entry.receiver}</td>
        `;
        tableBody.appendChild(row);
    }

    function downloadCSV() {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        if (entries.length === 0) {
            showToast('No entries to download');
            return;
        }

        // Convert entries to CSV format
        let csv = 'Item,Date,Price,Category,Secondary Category,Importance,Cycle,Account,Transfer Type,Receiver\n';
        entries.forEach(entry => {
            csv += `${entry.item},${entry.date},${entry.price},${entry.category},${entry.secondaryCategory},${entry.importance},${entry.cycle},${entry.account},${entry.transferType},${entry.receiver}\n`;
        });

        // Create a download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'entries.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast('CSV downloaded successfully');
    }

    function importCSV(file) {
        loadingOverlay.style.display = 'flex';
        const reader = new FileReader();
        reader.onload = function(e) {
            loadingOverlay.style.display = 'none';
            const content = e.target.result;
            const lines = content.split('\n');
            const entries = [];

            // Skip the header line
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const parts = line.split(',');
                    if (parts.length === 10) {
                        const entry = {
                            item: parts[0],
                            date: parts[1],
                            price: parts[2],
                            category: parts[3],
                            secondaryCategory: parts[4],
                            importance: parts[5],
                            cycle: parts[6],
                            account: parts[7],
                            transferType: parts[8],
                            receiver: parts[9]
                        };
                        entries.push(entry);
                    }
                }
            }

            if (entries.length > 0) {
                // Save the entries to local storage
                let existingEntries = JSON.parse(localStorage.getItem('entries')) || [];
                existingEntries = existingEntries.concat(entries);
                localStorage.setItem('entries', JSON.stringify(existingEntries));

                // Clear the table and reload all entries
                tableBody.innerHTML = '';
                loadEntries();
                showToast(`${entries.length} entries imported successfully`);
            } else {
                showToast('No valid entries found in the CSV file');
            }
        };
        reader.readAsText(file);
    }

    function resetEntries() {
        if (confirm('Are you sure you want to clear all entries?')) {
            localStorage.removeItem('entries');
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            showToast('All entries cleared');
        }
    }

    function showToast(message) {
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
});
