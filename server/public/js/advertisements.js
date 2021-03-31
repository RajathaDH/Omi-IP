const imagePreview = document.getElementById('image-preview');

function previewImage(event){
    imagePreview.src = URL.createObjectURL(event.target.files[0]);
    imagePreview.onload = function(){
        URL.revokeObjectURL(imagePreview.src);
    }
}

function openEdit(advertisementId){
    const advertisementContent = document.getElementById('d' + advertisementId);
    const advertisementForm = document.getElementById('f' + advertisementId);

    if(advertisementForm.style.display == 'none'){
        advertisementContent.style.display = 'none';
        advertisementForm.style.display = 'block';
    } else {
        advertisementContent.style.display = 'block';
        advertisementForm.style.display = 'none';
    }
}

function cancelEdit(advertisementId){
    const advertisementContent = document.getElementById('d' + advertisementId);
    const advertisementForm = document.getElementById('f' + advertisementId);

    advertisementContent.style.display = 'block';
    advertisementForm.style.display = 'none';
}
