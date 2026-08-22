(() => {
  const STORAGE_KEYS = ['tasks', 'projects', 'team', 'settings', 'notifications', 'currentUser'];

  function downloadBackup() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: Object.fromEntries(STORAGE_KEYS.map((key) => [key, localStorage.getItem(key)])),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function restoreBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);
        if (!backup || backup.version !== 1 || !backup.data) throw new Error('invalid backup');
        STORAGE_KEYS.forEach((key) => {
          if (typeof backup.data[key] === 'string') localStorage.setItem(key, backup.data[key]);
        });
        window.location.reload();
      } catch {
        window.alert('ملف النسخة الاحتياطية غير صالح أو غير مدعوم.');
      }
    };
    reader.readAsText(file);
  }

  function initBackupControls() {
    const header = document.querySelector('.header-actions');
    if (!header || document.getElementById('backup-data-btn')) return;
    const exportButton = document.createElement('button');
    exportButton.id = 'backup-data-btn';
    exportButton.className = 'btn-icon';
    exportButton.type = 'button';
    exportButton.title = 'نسخ احتياطي';
    exportButton.setAttribute('aria-label', 'تصدير نسخة احتياطية');
    exportButton.innerHTML = '<i class="fas fa-download" aria-hidden="true"></i>';
    exportButton.addEventListener('click', downloadBackup);

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json,.json';
    importInput.hidden = true;
    importInput.addEventListener('change', () => {
      if (importInput.files?.[0]) restoreBackup(importInput.files[0]);
      importInput.value = '';
    });

    const importButton = exportButton.cloneNode(true);
    importButton.id = 'restore-data-btn';
    importButton.title = 'استعادة نسخة احتياطية';
    importButton.setAttribute('aria-label', 'استعادة نسخة احتياطية');
    importButton.innerHTML = '<i class="fas fa-upload" aria-hidden="true"></i>';
    importButton.addEventListener('click', () => importInput.click());
    header.prepend(importInput, importButton, exportButton);
  }

  document.addEventListener('DOMContentLoaded', initBackupControls);
})();
