const tabs = document.querySelectorAll('.tab');
const fields = document.querySelectorAll('.field');
const form = document.getElementById('qr-form');
const preview = document.getElementById('qr-preview');
const payloadPreview = document.getElementById('payload-preview');
const foreground = document.getElementById('foreground');
const background = document.getElementById('background');
const size = document.getElementById('size');
const download = document.getElementById('download');

let currentType = 'url';
let qrCode;

function composePayload() {
  const get = (id) => document.getElementById(id)?.value?.trim() || '';

  switch (currentType) {
    case 'text':
      return get('text-input') || 'Bonjour depuis le clone !';
    case 'email':
      return `mailto:${get('email-input') || 'contact@exemple.com'}`;
    case 'phone':
      return `tel:${get('phone-input') || '+33600000000'}`;
    case 'sms':
      return `SMSTO:${get('sms-number') || '+33600000000'}:${get('sms-message') || ''}`;
    case 'wifi': {
      const ssid = get('wifi-ssid') || 'Mon WiFi';
      const pass = get('wifi-password') || 'motdepasse';
      return `WIFI:T:WPA;S:${ssid};P:${pass};;`;
    }
    case 'url':
    default:
      return get('url-input') || 'https://example.com';
  }
}

function renderQR() {
  const payload = composePayload();
  payloadPreview.textContent = `Contenu: ${payload}`;
  preview.innerHTML = '';

  qrCode = new QRCode(preview, {
    text: payload,
    width: Number(size.value),
    height: Number(size.value),
    colorDark: foreground.value,
    colorLight: background.value,
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function setType(type) {
  currentType = type;
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.type === type));
  fields.forEach((field) => field.classList.toggle('hidden', field.dataset.field !== type));
  renderQR();
}

tabs.forEach((tab) => tab.addEventListener('click', () => setType(tab.dataset.type)));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderQR();
});

[foreground, background, size].forEach((control) => control.addEventListener('input', renderQR));

form.querySelectorAll('input, textarea').forEach((input) => {
  input.addEventListener('input', () => {
    if (input.closest('.field')?.dataset.field === currentType) {
      renderQR();
    }
  });
});

download.addEventListener('click', () => {
  const canvas = preview.querySelector('canvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = `qr-${currentType}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

renderQR();
