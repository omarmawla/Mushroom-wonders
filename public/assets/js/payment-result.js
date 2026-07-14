(function () {
  const params = new URLSearchParams(window.location.search);
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && value) element.textContent = value;
  };
  setText('resultTran', params.get('tran_id'));
  setText('resultAmount', params.get('amount') ? `৳${params.get('amount')}` : '');
  setText('resultProduct', params.get('product'));

  function fallbackWhatsAppUrl() {
    try {
      const order = JSON.parse(sessionStorage.getItem('mw-pending-order') || 'null');
      if (!order) return '';
      const lines = [
        'New Order — Mushroom Wonders',
        'Payment: Paid Online',
        `Order reference: ${params.get('tran_id') || order.transactionId || ''}`,
        `Name: ${order.name}`,
        `Mobile: ${order.phone}`,
        `Product: ${order.productLabel}`,
        `Quantity: ${order.qty}`,
        `Items: ৳${order.subtotal}`,
        `Delivery: ৳${order.shipping} (${order.areaLabel})`,
        `Total: ৳${order.total}`,
        `Address: ${order.address}`,
      ];
      return `https://wa.me/8801516567622?text=${encodeURIComponent(lines.join('\n'))}`;
    } catch (_) {
      return '';
    }
  }

  const redirectMessage = document.getElementById('whatsappRedirectMessage');
  const whatsapp = params.get('whatsapp') || (redirectMessage ? fallbackWhatsAppUrl() : '');
  if (whatsapp) {
    try {
      const whatsappUrl = new URL(whatsapp);
      if (whatsappUrl.protocol === 'https:' && whatsappUrl.hostname === 'wa.me') {
        let seconds = 5;
        const renderCountdown = () => {
          if (!redirectMessage) return;
          const language = document.documentElement.getAttribute('data-lang') || 'bn';
          const localizedSeconds = seconds.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD');
          redirectMessage.textContent = i18n[language].pay_opening_whatsapp.replace('{seconds}', localizedSeconds);
          redirectMessage.hidden = false;
        };
        renderCountdown();
        document.addEventListener('mw:languagechange', renderCountdown);
        const countdown = window.setInterval(() => {
          seconds -= 1;
          renderCountdown();
          if (seconds <= 0) {
            window.clearInterval(countdown);
            window.location.assign(whatsappUrl.href);
          }
        }, 1000);
      }
    } catch (_) {}
  }

  function updateFailureMessage() {
    const message = document.getElementById('resultMessage');
    if (!message || params.get('reason') !== 'cancelled') return;
    const language = document.documentElement.getAttribute('data-lang') || 'bn';
    message.textContent = i18n[language].pay_cancel_desc;
    message.dataset.i18n = 'pay_cancel_desc';
  }
  updateFailureMessage();
  document.addEventListener('mw:languagechange', updateFailureMessage);
})();
