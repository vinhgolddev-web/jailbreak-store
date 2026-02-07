export function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '0 VNĐ';
    return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
}

export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
}
