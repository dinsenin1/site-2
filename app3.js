document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.querySelector('#downloadTable tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    const rowsPerPage = 100;
    let currentPage = 1;

    function renderTable() {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        rows.forEach((row, index) => {
            row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
        });

        const totalPages = Math.ceil(rows.length / rowsPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }

    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredRows = rows.filter(row => {
            return row.textContent.toLowerCase().includes(searchTerm);
        });

        tableBody.innerHTML = ''; // Clear the current table body
        if (filteredRows.length > 0) {
            filteredRows.forEach(row => tableBody.appendChild(row));
        } else {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `<td colspan="5" style="text-align: center;">No results found.</td>`;
            tableBody.appendChild(noResultsRow);
        }

        currentPage = 1; // Reset to first page on search
        renderTable();
    }

    // Event Listeners
    searchInput.addEventListener('keyup', filterTable);

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Initial render
    renderTable();
});