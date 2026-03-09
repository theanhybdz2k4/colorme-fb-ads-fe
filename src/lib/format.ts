/**
 * Centralized formatting utilities for the dashboard to ensure consistency
 * across all components (e.g., .toFixed(2) for percentages).
 */

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

export const formatPercent = (value: number) => {
    // Enforce consistent 2 decimal places for precision
    return `${value.toFixed(2)}%`;
};

export const formatCompactCurrency = (value: number) => {
    if (Math.abs(value) >= 1e9) {
        return `${(value / 1e9).toFixed(1).replace(/\.0$/, '').replace('.', ',')} tỷ`;
    }
    if (Math.abs(value) >= 1e6) {
        return `${(value / 1e6).toFixed(1).replace(/\.0$/, '').replace('.', ',')}tr`;
    }
    if (Math.abs(value) >= 1e3) {
        return `${(value / 1e3).toFixed(1).replace(/\.0$/, '').replace('.', ',')}k`;
    }
    return formatCurrency(value);
};

export const formatCompactNumber = (value: number) => {
    if (Math.abs(value) >= 1e9) {
        return `${(value / 1e9).toFixed(1).replace(/\.0$/, '').replace('.', ',')} tỷ`;
    }
    if (Math.abs(value) >= 1e6) {
        return `${(value / 1e6).toFixed(1).replace(/\.0$/, '').replace('.', ',')}tr`;
    }
    if (Math.abs(value) >= 1e4) {
        return `${(value / 1e3).toFixed(1).replace(/\.0$/, '').replace('.', ',')}k`;
    }
    return new Intl.NumberFormat('vi-VN').format(value);
};
