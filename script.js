document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    updateItemSuggestions();
    
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

    document.getElementById('expense-view').classList.add('active');

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

        const item = document.getElementById('item').value ? document.getElementById('item').value : "NONE";
        const date = document.getElementById('date').value;
        const price = document.getElementById('price').value;
        const category = document.getElementById('category').value;
        const secondaryCategory = document.getElementById('secondaryCategory').value ? document.getElementById('secondaryCategory').value : "NONE";
        const importance = document.getElementById('importance').value ? document.getElementById('importance').value : "NONE";
        const cycle = document.getElementById('cycle').value ? document.getElementById('cycle').value : "NONE";
        const account = document.getElementById('account').value;
        const transferType = document.getElementById('transferType').value;
        const receiver = document.getElementById('receiver').value ? document.getElementById('receiver').value : "NONE";

        // Create a new entry
        const entry = { item, date, price, category, secondaryCategory, importance, cycle, account, transferType, receiver };

        // Save the entry to local storage
        saveEntry(entry);

        // Add the entry to the table
        addEntryToTable(entry);
        updateItemSuggestions(); 

        // Reset the form
        form.reset();
        document.getElementById('date').value = today;

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

    function updateItemSuggestions() {
        const datalist = document.getElementById('itemSuggestions');
        datalist.innerHTML = ''; // Clear existing suggestions

        // Get all saved entries from localStorage
        const entries = JSON.parse(localStorage.getItem('entries')) || [];

        // Get unique item names
        const uniqueItems = [...new Set(entries.map(e => e.item).filter(Boolean))];

        // Create <option> elements for each item
        uniqueItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            datalist.appendChild(option);
        });
    }

    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        if (entries.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            entries.forEach(entry => addEntryToTable(entry));
            updateItemSuggestions();
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

    /**
     * DYNAMIC FORM CONFIG
     */
    const formConfig = {
        transferTypes: {
            Expense: {
                showFields: ["importance", "cycle", "secondaryCategory"],
                hideFields: ["receiver"],
                categories: [
                    "Personal",
                    "Groceries",
                    "Household",
                    "Medical",
                    "Transport",
                    "Taxes",
                    "Rent",
                    "Subscriptions",
                    "Pet Care",
                    "Entertainment",
                    "Misc",
                ],
            },
            Income: {
                showFields: [],
                hideFields: [
                    "importance",
                    "cycle",
                    "receiver",
                    "secondaryCategory",
                ],
                categories: [
                    "Salary",
                    "Bonuses",
                    "Tips",
                    "Gift Income",
                    "Business Income",
                    "Side Hustles",
                    "Freelance",
                    "Investment",
                ],
            },
            Transfer: {
                showFields: ["receiver"],
                hideFields: ["importance", "cycle", "secondaryCategories"],
                categories: [
                    "Emergency Fund",
                    "Insurance Payment Fund",
                    "Vacation Fund",
                    "Long-Term Goals Fund",
                    "New Furniture Fund",
                    "Self-employed Retirement Account Contributions",
                    "Investment Expenses",
                    "Saving Fund"
                ],
            },
        },

        secondaryCategories: {
            Personal: [
                "Dining Out",
                "Coffee",
                "Snacks",
                "Haircuts",
                "Gym Membership",
                "Massage Services",
                "Alcoholic Beverages",
                "Non-Alcoholic Beverages",
                "Clothing",
                "Skin Care Products",
                "Cosmetics",
                "Bathing & Hygiene Goods",
            ],
            Groceries: [
                "Groceries",
                "Snacks",
                "Alcoholic Beverages",
                "Non-Alcoholic Beverages",
                "Bathing & Hygiene Goods",
                "Cosmetics",
                "Skin Care Products",
            ],
            Transport: [
                "Car Payment",
                "Car Insurance",
                "Fuel",
                "Car Repairs",
                "Parking Fees",
                "Car Washes",
                "Tolls",
                "Train Passes",
                "Bus Passes",
                "Subway/Metro Passes",
                "Taxi",
            ],
            Household: [
                "Paper Products",
                "Kitchen Items",
                "Cleaning Supplies",
                "Tools",
                "Bills",
            ],
            Medical: [
                "Prescriptions",
                "Alternative Medication",
                "Vitamins and Supplements",
                "First Aid Supplies",
                "Dental",
            ],
            Subscriptions: [
                "Video Streaming Services",
                "Music Streaming Services",
                "Magazine Subscriptions",
                "Gym Memberships",
                "Professional Memberships",
                "Storage Unit Rent",
                "Education Subscriptions",
            ],
            "Pet Care": [
                "Pet Food",
                "Pet Treats",
                "Toys",
                "Vaccinations",
                "Medications",
                "Vet Bills",
            ],
            Entertainment: [
                "Sporting Events",
                "Hobbies",
                "Technology Expenses",
                "Books",
                "Concerts",
                "Games",
                "Vacations",
            ],
            Misc: [
                "Random Expenses",
                "ATM Fees",
                "Other Banking Fees",
                "Tips",
                "Emergency",
            ],
            Taxes: [
                "Gelir Vergisi",
                "Damga Vergisi",
                "SSK Primi",
                "İşsizlik Primi",
                "Õzel Kesinti Toplamı",
            ],
        },
    };

    const transferType = document.getElementById('transferType');
    const category = document.getElementById('category');
    const secondaryCategory = document.getElementById('secondaryCategory');
    const importanceGroup = document.querySelector('label[for="importance"]').closest('.form-group');
    const cycleGroup = document.querySelector('label[for="cycle"]').closest('.form-group');
    const receiverGroup = document.querySelector('label[for="receiver"]').closest('.form-group');
    const secondaryCategoryGroup = document.getElementById('secondaryCategory').closest('.form-group');

    const fieldGroups = {
        importance: importanceGroup,
        cycle: cycleGroup,
        receiver: receiverGroup,
        secondaryCategory: secondaryCategoryGroup,
    };

    refreshFormBindings();

    function updateCategoryOptions(selectedType) {
        const optgroups = category.querySelectorAll('optgroup');
        optgroups.forEach(group => (group.style.display = 'none'));
        category.disabled = !selectedType;
        category.value = '';

        if (!selectedType) return;

        const config = formConfig.transferTypes[selectedType];
        if (!config) return;

        const groupToShow = category.querySelector(`optgroup[label="${selectedType}"]`);
        if (groupToShow) {
            groupToShow.style.display = 'block';
            // Auto-select first if exists
            category.value = groupToShow.querySelector('option')?.value || '';
        }
    }

    function updateSecondaryCategoryOptions(selectedCategory) {
        const validOptions = formConfig.secondaryCategories[selectedCategory] || [];

        // Clear existing options except placeholder
        Array.from(secondaryCategory.options)
            .slice(1)
            .forEach(opt => opt.remove());

        if(validOptions.length === 0){
            fieldGroups.secondaryCategory.style.display = 'none';
            return;
        } else {
            fieldGroups.secondaryCategory.style.display = 'block';
        }

        // Add new options
        validOptions.forEach(optVal => {
            const opt = document.createElement("option");
            opt.value = optVal;
            opt.textContent = optVal;
            secondaryCategory.appendChild(opt);
        });

        secondaryCategory.value = '';
    }

    function updateFieldVisibility(selectedType) {
        // Reset all
        Object.values(fieldGroups).forEach(g => (g.style.display = 'none'));

        if (!selectedType || !formConfig.transferTypes[selectedType]) return;

        const { showFields } = formConfig.transferTypes[selectedType];
        showFields.forEach(field => {
            if (fieldGroups[field]) fieldGroups[field].style.display = 'block';
        });
    }

    function refreshFormBindings() {
        const type = transferType.value;
        const cat = category.value;
        updateCategoryOptions(type);
        updateSecondaryCategoryOptions(cat);
        updateFieldVisibility(type);
    }

    transferType.addEventListener('change', function () {
        updateCategoryOptions(this.value);
        updateFieldVisibility(this.value);
    });

    category.addEventListener('change', function () {
        updateSecondaryCategoryOptions(this.value);
    });

    /**
     * STATISTICS
     */

    function loadStatistics() {
        const entries = JSON.parse(localStorage.getItem("entries")) || [];
        if (entries.length === 0) {
            showToast("No entries available for statistics");
            return;
        }

        loadImportanceChart(entries);
        loadCategoryChart(entries);
        loadInsights(entries);
    }

    function loadImportanceChart(entries) {
        // Sum total price for each importance level
        const importanceSums = { Need: 0, Want: 0, Saving: 0 };
        entries.forEach((entry) => {
            const imp = entry.importance;
            const price = parseFloat(entry.price) || 0;
            if (importanceSums[imp] !== undefined) {
                importanceSums[imp] += price;
            }
        });

        const total = Object.values(importanceSums).reduce((a, b) => a + b, 0);
        if (total === 0) {
            showToast("No data available for importance chart");
            return;
        }

        const labels = ["Need", "Want", "Saving"];
        const data = labels.map((label) => importanceSums[label]);
        const percentages = data.map((v) => ((v / total) * 100).toFixed(1));

        const ctx = document.getElementById("importanceChart").getContext("2d");

        if (window.importanceChart && typeof window.importanceChart.destroy === "function") {
            window.importanceChart.destroy();
        }

        window.importanceChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels.map(
                    (l, i) => `${l} (${data[i].toFixed(2)} TL / ${percentages[i]}%)`
                ),
                datasets: [
                    {
                        data,
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.6)", // Need
                            "rgba(54, 162, 235, 0.6)", // Want
                            "rgba(75, 192, 192, 0.6)", // Saving
                        ],
                        borderColor: "#fff",
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Spending Distribution by Importance (Total TL)",
                    },
                    legend: {
                        position: "bottom",
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) =>
                                `${ctx.label.split(" ")[0]}: ${ctx.parsed.toFixed(
                                    2
                                )} TL (${(
                                    (ctx.parsed / total) *
                                    100
                                ).toFixed(1)}%)`,
                        },
                    },
                },
            },
        });
    }
    function loadCategoryChart(entries) {
        const categoryTotals = {};

        entries.forEach(entry => {
            const cat = entry.category || "Uncategorized";
            const price = parseFloat(entry.price) || 0;
            if (!categoryTotals[cat]) categoryTotals[cat] = 0;
            categoryTotals[cat] += price;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const total = data.reduce((a, b) => a + b, 0);

        const ctx = document.getElementById("categoryChart").getContext("2d");

        if (window.categoryChart && typeof window.categoryChart.destroy === "function") {
            window.categoryChart.destroy();
        }

        window.categoryChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Total Spending (TL)",
                    data,
                    backgroundColor: "rgba(0, 122, 255, 0.6)",
                    borderColor: "rgba(0, 122, 255, 1)",
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Spending by Category",
                        font: { size: 18 },
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.parsed.y.toFixed(2)} TL (${((ctx.parsed.y / total) * 100).toFixed(1)}%)`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Amount (TL)" }
                    },
                    x: {
                        ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 }
                    }
                }
            }
        });
    }
    function loadInsights(entries) {
        const totalSpent = entries.reduce((sum, e) => sum + parseFloat(e.price || 0), 0);
        if (totalSpent === 0) {
            document.getElementById("insights").innerHTML = "<p>No spending data available.</p>";
            return;
        }

        // Calculate per-category totals
        const categoryTotals = {};
        entries.forEach(e => {
            const cat = e.category || "Uncategorized";
            const price = parseFloat(e.price) || 0;
            if (!categoryTotals[cat]) categoryTotals[cat] = 0;
            categoryTotals[cat] += price;
        });

        const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
        const topCategory = sorted[0];
        const insightsDiv = document.getElementById("insights");

        let html = `<p><strong>Total Spent:</strong> ${totalSpent.toFixed(2)} TL</p>`;
        if (topCategory) {
            html += `<p><strong>Top Category:</strong> ${topCategory[0]} (${topCategory[1].toFixed(2)} TL)</p>`;
        }

        html += "<p><strong>Breakdown:</strong></p><ul>";
        sorted.slice(0, 5).forEach(([cat, val]) => {
            html += `<li>${cat}: ${val.toFixed(2)} TL (${((val / totalSpent) * 100).toFixed(1)}%)</li>`;
        });
        html += "</ul>";

        insightsDiv.innerHTML = html;
    }

    document.querySelector('[data-tab="stats-view"]').addEventListener('click', loadStatistics);

});
