let currentSession = null

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']

function looksLikeImage(item) {
  if (item.file_type === 'picture') return true
  if (!item.file_url) return false
  const url = item.file_url.toLowerCase()
  return IMAGE_EXTENSIONS.some(ext => url.includes(ext))
}

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession()
  currentSession = data.session
  updateUI()
}

function updateUI() {
  document.getElementById('adminGate').style.display = currentSession ? 'none' : 'block'
  document.getElementById('composer').style.display = currentSession ? 'block' : 'none'
  document.getElementById('adminBadge').style.display = currentSession ? 'inline-block' : 'none'
  loadPhotos()
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

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = document.getElementById('photoTitle').value
  const category = document.getElementById('photoCategory').value
  const file = document.getElementById('photoFile').files[0]

  if (!file) {
    alert('Please choose a photo')
    return
  }

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

  const { error: insertError } = await supabaseClient
    .from('documents')
    .insert({
      title,
      file_url: urlData.publicUrl,
      file_type: 'picture',
      category
    })

  if (insertError) {
    alert('Saved file but failed to record it: ' + insertError.message)
    return
  }

  document.getElementById('uploadForm').reset()
  loadPhotos()
})

async function loadPhotos() {
  const { data, error } = await supabaseClient
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  const photos = data.filter(looksLikeImage)

  const container = document.getElementById('file-list')
  container.innerHTML = photos.map(file => {
    const cat = file.category || 'campus'
    return `
    <figure class="gallery-item" data-cat="${cat}" >
      <button data-lightbox="${file.file_url}" data-caption="${file.title}" style="all:unset;cursor:pointer;display:block;width:100%;">
        <img src="${file.file_url}" alt="${file.title}" loading="lazy">
        <figcaption>
          <span class="tag">${file.title}</span>
          ${currentSession ? `<button onclick="deletePhoto('${file.id}')" style="all:unset;cursor:pointer;background:rgba(0,0,0,.5);color:#fff;border-radius:50%;width:22px;height:22px;text-align:center;line-height:22px;font-size:14px;">&times;</button>` : ''}
        </figcaption>
      </button>
    </figure>
  `
  }).join('')
}

async function deletePhoto(id) {
  if (!confirm('Delete this photo?')) return
  const { error } = await supabaseClient.from('documents').delete().eq('id', id)
  if (error) {
    alert('Delete failed: ' + error.message)
    return
  }
  loadPhotos()
}

checkSession()
