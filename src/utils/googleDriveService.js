/**
 * Utilitário para integração com Google Drive API v3
 */

export function pedirTokenGoogle(clientId) {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        if (response.error) return reject(response);
        resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
}

export async function listarBackupsDrive(token) {
  const resp = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=name contains "backup-caderno-" and trashed = false&fields=files(id, name, createdTime)&orderBy=createdTime desc',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const data = await resp.json();
  return data.files || [];
}

export async function enviarArquivoDrive(token, blob, nomeArquivo) {
  const metadata = {
    name: nomeArquivo,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const resp = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );
  return await resp.json();
}

export async function baixarBackupDrive(token, fileId) {
  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return await resp.json();
}

export function fmtDataHora(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}