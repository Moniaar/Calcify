document.addEventListener('DOMContentLoaded', async () => {
    const customersTable = document.getElementById('customers-table');

    async function fetchCustomers() {
        const customers = await window.electronAPI.fetchCustomers();
        customersTable.innerHTML = ''; // Clear the table before adding new rows

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.company_name || 'N/A'}</td>
                <td>${customer.phone_number || 'N/A'}</td>
                <td>${customer.invoice_type === 'sale' ? 'Sale' : 'Purchase'}</td>
                <td>${customer.invoice_number || 'N/A'}</td>
            `;
            customersTable.appendChild(row);
        });
    }

    await fetchCustomers();
});