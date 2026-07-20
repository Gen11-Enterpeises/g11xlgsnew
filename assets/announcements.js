let currentSession = null

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession()
  currentSession = data.session
  updateUI()
}

function updateUI() {
  document.getElementById('adminGate').style.display = currentSession ? 'none' : 'block'
  document.getElementById('composer').style.display = currentSession ? 'block' : 'none'
  document.getElementById('adminBadge').style.display = currentSession ? 'inline-block' : 'none'
  loadAnnouncements()
}

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('adminUser').value
  const password = document.getElementById('adminPass').value
  const errorEl = document.getElementById('loginError')
  errorEl.style.display = 'none'

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
  if (error) {
    errorEl.textContent = error.message
    errorEl.style.display = 'block'
    return
  }
  currentSession = data.session
  updateUI()
})

document.getElementById('adminLogout').addEventListener('click', async () => {
  await supabaseClient.auth.signOut()
  currentSession = null
  updateUI()
})

document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = document.getElementById('postTitle').value
  const message = document.getElementById('postMessage').value
  const file = document.getElementById('postFile').files[0]

  let file_url = null
  let file_type = 'announcement'

  if (file) {
    const fileName = `${Date.now()}-${file.name}`
    const { error: uploadError } = await supabaseClient.storage
      .from('school-files')
      .upload(fileName, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      return
    }

    const { data: urlData } = supabaseClient.storage
      .from('school-files')
      .getPublicUrl(fileName)

    file_url = urlData.publicUrl
    // Announcements attachments are tagged 'document' even if it's an image file,
    // so they never get pulled into the gallery feed (which only looks for 'picture').
    file_type = 'document'
  }

  const { error: insertError } = await supabaseClient
    .from('documents')
    .insert({ title, description: message, file_url, file_type })

  if (insertError) {
    alert('Failed to post: ' + insertError.message)
    return
  }

  document.getElementById('postForm').reset()
  loadAnnouncements()
})

async function loadAnnouncements() {
  const { data, error } = await supabaseClient
    .from('documents')
    .select('*')
    .neq('file_type', 'picture')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  const list = document.getElementById('announceList')
  list.innerHTML = data.map(item => {
    const safeTitle = (item.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
    return `
    <div class="glass" style="padding:20px;margin-bottom:16px;">
      <h4>${item.title}</h4>
      ${item.description ? `<p>${item.description}</p>` : ''}
      ${item.file_url ? `<a href="${item.file_url}" target="_blank">Download attachment</a>` : ''}
      ${currentSession ? `<div class="mt-16" style="display:flex;gap:10px;">
        <button onclick="editItem('${item.id}', '${safeTitle}')" class="btn btn-outline btn-sm">Edit</button>
        <button onclick="deleteItem('${item.id}')" class="btn btn-outline btn-sm">Delete</button>
      </div>` : ''}
    </div>
  `
  }).join('')
}

async function editItem(id, currentTitle) {
  const newTitle = prompt('Edit title:', currentTitle)
  if (newTitle === null || newTitle.trim() === '') return

  const { error } = await supabaseClient
    .from('documents')
    .update({ title: newTitle })
    .eq('id', id)

  if (error) {
    alert('Update failed: ' + error.message)
    return
  }
  loadAnnouncements()
}

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return
  const { error } = await supabaseClient.from('documents').delete().eq('id', id)
  if (error) {
    alert('Delete failed: ' + error.message)
    return
  }
  loadAnnouncements()
}

checkSession()
