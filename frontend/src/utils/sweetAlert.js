import Swal from 'sweetalert2'

// Confirm dialog
export const confirmDialog = (title = 'Are you sure?', message = '', confirmText = 'Yes', cancelText = 'No') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FF6B6B',
    cancelButtonColor: '#6B7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  })
}

// Success alert
export const successAlert = (title = 'Success', message = '') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#FF6B6B',
    timer: 2000
  })
}

// Error alert
export const errorAlert = (title = 'Error', message = '') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#FF6B6B'
  })
}

// Info alert
export const infoAlert = (title = 'Info', message = '') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonColor: '#FF6B6B'
  })
}

// Loading alert
export const loadingAlert = (title = 'Loading...') => {
  return Swal.fire({
    title,
    icon: 'info',
    didOpen: () => {
      Swal.showLoading()
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonText: 'Close'
  })
}

// Close alert
export const closeAlert = () => {
  Swal.close()
}
