// Google reCAPTCHA v2 verification helper
// Requires RECAPTCHA_SECRET_KEY in .env

export async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  // If no secret key configured, skip verification (development mode)
  if (!secretKey) {
    console.warn('[reCAPTCHA] RECAPTCHA_SECRET_KEY not configured, skipping verification');
    return { success: true, skipped: true };
  }
  
  if (!token) {
    return { 
      success: false, 
      error: 'recaptcha_missing',
      message: 'Lütfen robot olmadığınızı doğrulayın'
    };
  }
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token
      })
    });
    
    if (!response.ok) {
      console.error('[reCAPTCHA] API request failed:', response.status);
      return { 
        success: false, 
        error: 'recaptcha_api_error',
        message: 'Doğrulama servisi şu anda kullanılamıyor'
      };
    }
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true };
    } else {
      console.warn('[reCAPTCHA] Verification failed:', data['error-codes']);
      return { 
        success: false, 
        error: 'recaptcha_invalid',
        message: 'Robot doğrulaması başarısız. Lütfen tekrar deneyin.',
        errorCodes: data['error-codes']
      };
    }
  } catch (error) {
    console.error('[reCAPTCHA] Error:', error.message);
    return { 
      success: false, 
      error: 'recaptcha_error',
      message: 'Doğrulama sırasında bir hata oluştu'
    };
  }
}

export default verifyRecaptcha;
