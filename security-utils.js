(function (root) {
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    root.TaskFlowSecurity = { escapeHtml };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { escapeHtml };
    }
})(typeof globalThis !== 'undefined' ? globalThis : window);
