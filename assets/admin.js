async function login() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password })

  if (error) {
    alert(error.message)
  } else {
    document.getElementById('login-section').style.display = 'none'
    document.getElementById('upload-section').style.display = 'block'
  }
}

async function uploadFile() {
  const file = document.getElementById('fileInput').files[0]
  const title = document.getElementById('title').value
  const fileType = document.getElementById('fileType').value

  if (!file || !title) {
    alert('Please choose a file and enter a title')
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
      title: title,
      file_url: urlData.publicUrl,
      file_type: fileType
    })

  if (insertError) {
    alert('Saved file but failed to record it: ' + insertError.message)
    return
  }

  alert('Uploaded successfully!')
  document.getElementById('title').value = ''
  document.getElementById('fileInput').value = ''
}
