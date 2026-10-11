import Swal from 'sweetalert2'

// Confirm dialog
export const confirmDialog = (title = 'Are you sure?', message = '', confirmText = 'Yes', cancelText = 'No') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#173B64',
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
    confirmButtonColor: '#173B64',
    timer: 2000
  })
}

// Error alert
export const errorAlert = (title = 'Error', message = '') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#173B64'
  })
}

// Info alert
export const infoAlert = (title = 'Info', message = '') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonColor: '#173B64'
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
