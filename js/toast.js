function showToast(msg, success = true) {
  const existing = document.getElementById('_toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = '_toast';
  toast.className = [
    'fixed top-6 right-6 z-[9999] flex items-center gap-3',
    'px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold',
    'transition-all duration-300 opacity-0 translate-y-2',
    success ? 'bg-green-600' : 'bg-red-600'
  ].join(' ');

  const icon = success
    ? '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
    : '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';

  toast.innerHTML = icon + '<span>' + msg + '</span>';
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}
