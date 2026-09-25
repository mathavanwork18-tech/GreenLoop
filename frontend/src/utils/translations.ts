import type { LanguageCode } from '../types/common.types'

export interface AuthTranslations {
  // Screen 1: Language Selection
  chooseLanguage: string
  selectLanguageSubtitle: string
  continueBtn: string

  // Screen 2: Phone Login
  welcomeBack: string
  loginSubtitle: string
  phonePlaceholder: string
  sendOtp: string
  sendingOtp: string
  orContinueWith: string
  googleLogin: string
  appleLogin: string
  noAccountPrompt: string
  signUpLink: string
  invalidPhoneError: string

  // Screen 3: OTP Verification
  enterOtp: string
  otpSentTo: string
  resendIn: string
  didntReceive: string
  resendOtp: string
  verifying: string
  otpInvalidError: string
  otpExpiredError: string
  otpRateLimitError: string
  otpProviderError: string
  otpResentSuccess: string
  otpRequiredError: string
  otpSuccess: string

  // Screen 4: Account Type
  selectAccountType: string
  selectRoleSubtitle: string
  citizenTitle: string
  citizenDesc: string
  shopTitle: string
  shopDesc: string

  // Screen 5: Citizen Registration
  citizenHeading: string
  citizenSubtitle: string
  profilePhoto: string
  camera: string
  gallery: string
  skip: string
  fullName: string
  fullNamePlaceholder: string
  fullNameError: string
  emailOptional: string
  emailPlaceholder: string
  emailError: string
  password: string
  passwordPlaceholder: string
  confirmPassword: string
  confirmPasswordPlaceholder: string
  passwordMismatchError: string
  passReqLength: string
  passReqUpper: string
  passReqLower: string
  passReqNumber: string
  passReqSpecial: string
  area: string
  areaPlaceholder: string
  city: string
  cityPlaceholder: string
  landmarkOptional: string
  landmarkPlaceholder: string
  gpsSectionTitle: string
  gpsSectionDesc: string
  useCurrentLocation: string
  locating: string
  locationAcquired: string
  chooseOnMap: string
  locationError: string

  // Screen 6: Local Shop Registration
  shopHeading: string
  shopSubtitle: string
  shopName: string
  shopNamePlaceholder: string
  shopNameError: string
  ownerName: string
  ownerNamePlaceholder: string
  ownerNameError: string
  shopCategory: string
  selectCategory: string
  verifiedMobileNumber: string
  mobileLockedBadge: string
  shopAddress: string
  shopAddressPlaceholder: string
  shopAddressError: string

  // Resume Draft Modal
  resumeTitle: string
  resumeDesc: string
  resumeContinue: string
  startOver: string

  // Navigation
  back: string
}

export const AUTH_TRANSLATIONS: Record<LanguageCode, AuthTranslations> = {
  EN: {
    chooseLanguage: 'Choose your Language',
    selectLanguageSubtitle: 'Select your preferred language to continue with Green Loop',
    continueBtn: 'Continue',

    welcomeBack: 'Welcome Back!',
    loginSubtitle: 'Login to continue to Green Loop',
    phonePlaceholder: 'Enter phone number',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending OTP...',
    orContinueWith: 'Or continue with',
    googleLogin: 'Continue with Google',
    appleLogin: 'Continue with Apple',
    noAccountPrompt: "Don't have an account?",
    signUpLink: 'Sign up',
    invalidPhoneError: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)',

    enterOtp: 'Enter OTP',
    otpSentTo: 'We have sent a 6-digit code to',
    resendIn: 'Resend OTP in',
    didntReceive: "Didn't receive it?",
    resendOtp: 'Resend OTP',
    verifying: 'Verifying OTP...',
    otpInvalidError: 'Incorrect OTP. Please check the code and try again.',
    otpExpiredError: 'This OTP has expired. Please request a new OTP.',
    otpRateLimitError: 'Too many OTP requests. Please wait and try again.',
    otpProviderError: 'OTP service is temporarily unavailable. Please try again later.',
    otpResentSuccess: 'A new OTP has been sent.',
    otpRequiredError: 'Please enter all 6 digits of the OTP.',
    otpSuccess: 'OTP verified successfully!',

    selectAccountType: 'Select Account Type',
    selectRoleSubtitle: 'Choose how you want to participate in the circular economy',
    citizenTitle: 'CITIZEN',
    citizenDesc: 'Recycle, Earn, Make Impact',
    shopTitle: 'LOCAL SHOP',
    shopDesc: 'Collect, Repair, Earn More',

    citizenHeading: 'Create your Citizen Account',
    citizenSubtitle: 'Join our community to recycle e-waste and earn Green Coins',
    profilePhoto: 'Profile Photo (Optional)',
    camera: 'Take Photo',
    gallery: 'Upload Photo',
    skip: 'Skip for now',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    fullNameError: 'Full name must be at least 3 characters',
    emailOptional: 'Email Address (Optional)',
    emailPlaceholder: 'e.g. yourname@example.com',
    emailError: 'Please enter a valid email address format',
    password: 'Password',
    passwordPlaceholder: 'Create a secure password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    passwordMismatchError: 'Passwords do not match',
    passReqLength: '8+ characters',
    passReqUpper: 'Uppercase letter',
    passReqLower: 'Lowercase letter',
    passReqNumber: 'Number',
    passReqSpecial: 'Special character (@$!%*?&)',
    area: 'Area / Neighborhood',
    areaPlaceholder: 'e.g. Guindy, Velachery',
    city: 'City',
    cityPlaceholder: 'e.g. Chennai',
    landmarkOptional: 'Landmark (Optional)',
    landmarkPlaceholder: 'e.g. Near Metro Station',
    gpsSectionTitle: 'GPS Location',
    gpsSectionDesc: 'Helps nearby repair shops and recycling hubs find you for easy pickups',
    useCurrentLocation: 'Use Current Location',
    locating: 'Fetching GPS coordinates...',
    locationAcquired: 'GPS location captured successfully',
    chooseOnMap: 'Choose on Map',
    locationError: 'Please specify your Area and City or use GPS location',

    shopHeading: 'Register your Shop',
    shopSubtitle: 'Expand your repair business & collect verified e-waste with Green Loop',
    shopName: 'Shop Name',
    shopNamePlaceholder: 'e.g. Chennai Circuit Hub',
    shopNameError: 'Shop name is required',
    ownerName: 'Owner Name',
    ownerNamePlaceholder: 'e.g. Rajesh Kumar',
    ownerNameError: 'Owner name is required',
    shopCategory: 'Shop Category',
    selectCategory: 'Select category',
    verifiedMobileNumber: 'Verified Mobile Number',
    mobileLockedBadge: 'OTP Verified & Locked',
    shopAddress: 'Shop Address',
    shopAddressPlaceholder: 'Enter street address & shop number',
    shopAddressError: 'Shop address is required',

    resumeTitle: 'Resume Registration?',
    resumeDesc: 'You have unfinished registration progress for this phone number.',
    resumeContinue: 'Resume where you left off',
    startOver: 'Start Over',

    back: 'Back',
  },

  TA: {
    chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    selectLanguageSubtitle: 'கிரீன் லூப்பைத் தொடர விருப்பமான மொழியைத் தேர்வுசெய்யவும்',
    continueBtn: 'தொடரவும்',

    welcomeBack: 'மீண்டும் வருக!',
    loginSubtitle: 'கிரீன் லூப் கணக்கில் உள்நுழையவும்',
    phonePlaceholder: 'தொலைபேசி எண்ணை உள்ளிடவும்',
    sendOtp: 'OTP பெறுக',
    sendingOtp: 'OTP அனுப்பப்படுகிறது...',
    orContinueWith: 'அல்லது தொடரவும்',
    googleLogin: 'Google உடன் தொடரவும்',
    appleLogin: 'Apple உடன் தொடரவும்',
    noAccountPrompt: 'கணக்கு இல்லையா?',
    signUpLink: 'பதிவு செய்க',
    invalidPhoneError: 'சரியான 10 இலக்க இந்திய தொலைபேசி எண்ணை உள்ளிடவும் (எ.கா: 9876543210)',

    enterOtp: 'OTP உள்ளிடவும்',
    otpSentTo: '6 இலக்க குறியீடு அனுப்பப்பட்டது:',
    resendIn: 'மறுஅனுப்ப காலம்',
    didntReceive: 'குறியீடு வரவில்லையா?',
    resendOtp: 'OTP மீண்டும் அனுப்புக',
    verifying: 'சரிபார்க்கப்படுகிறது...',
    otpInvalidError: 'தவறான OTP. குறியீட்டைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    otpExpiredError: 'இந்த OTP காலாவதியானது. புதிய OTP ஐ கோரவும்.',
    otpRateLimitError: 'அதிகப்படியான OTP கோரிக்கைகள். சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.',
    otpProviderError: 'OTP சேவை தற்காலிகமாக கிடைக்கவில்லை. பின்னர் முயற்சிக்கவும்.',
    otpResentSuccess: 'புதிய OTP வெற்றிகரமாக அனுப்பப்பட்டது.',
    otpRequiredError: 'அனைத்து 6 இலக்கங்களையும் உள்ளிடவும்.',
    otpSuccess: 'OTP வெற்றிகரமாக சரிபார்க்கப்பட்டது!',

    selectAccountType: 'கணக்கு வகையைத் தேர்ந்தெடுக்கவும்',
    selectRoleSubtitle: 'சுழற்சி பொருளாதாரத்தில் உங்கள் பங்கைத் தேர்வுசெய்யவும்',
    citizenTitle: 'குடிமகன் (CITIZEN)',
    citizenDesc: 'மறுசுழற்சி செய், சம்பாதி, தாக்கத்தை உருவாக்கு',
    shopTitle: 'உள்ளூர் கடை (LOCAL SHOP)',
    shopDesc: 'சேகரி, பழுதுபார், அதிகம் சம்பாதி',

    citizenHeading: 'குடிமகன் கணக்கை உருவாக்கவும்',
    citizenSubtitle: 'மின்னணுக் கழிவுகளை மறுசுழற்சி செய்து Green Coins சம்பாதிக்கவும்',
    profilePhoto: 'சுயவிவரப் படம் (விருப்பத்திற்குரியது)',
    camera: 'புகைப்படம் எடு',
    gallery: 'படத்தைப் பதிவேற்று',
    skip: 'இப்போது தவிர்க்கவும்',
    fullName: 'முழு பெயர்',
    fullNamePlaceholder: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    fullNameError: 'முழு பெயர் குறைந்தது 3 எழுத்துக்கள் இருக்க வேண்டும்',
    emailOptional: 'மின்னஞ்சல் முகவரி (விருப்பத்திற்குரியது)',
    emailPlaceholder: 'எ.கா: yourname@example.com',
    emailError: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
    password: 'கடவுச்சொல்',
    passwordPlaceholder: 'பாதுகாப்பான கடவுச்சொல்லை உருவாக்கவும்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    confirmPasswordPlaceholder: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்',
    passwordMismatchError: 'கடவுச்சொற்கள் பொருந்தவில்லை',
    passReqLength: '8+ எழுத்துக்கள்',
    passReqUpper: 'பெரிய எழுத்து (A-Z)',
    passReqLower: 'சிறிய எழுத்து (a-z)',
    passReqNumber: 'எண் (0-9)',
    passReqSpecial: 'சிறப்பு எழுத்து (@$!%*?&)',
    area: 'பகுதி / வட்டாரம்',
    areaPlaceholder: 'எ.கா: கிண்டி, வேளச்சேரி',
    city: 'நகரம்',
    cityPlaceholder: 'எ.கா: சென்னை',
    landmarkOptional: 'அடையாள இடம் (விருப்பத்திற்குரியது)',
    landmarkPlaceholder: 'எ.கா: மெட்ரோ நிலையம் அருகில்',
    gpsSectionTitle: 'GPS இருப்பிடம்',
    gpsSectionDesc: 'அருகிலுள்ள கடைகள் மற்றும் மறுசுழற்சி மையங்கள் உங்களை எளிதில் சென்றடைய உதவும்',
    useCurrentLocation: 'தற்போதைய இருப்பிடத்தைப் பயன்படுத்து',
    locating: 'GPS இருப்பிடம் பெறப்படுகிறது...',
    locationAcquired: 'இருப்பிடம் வெற்றிகரமாகப் பெறப்பட்டது',
    chooseOnMap: 'வரைபடத்தில் தேர்வு செய்',
    locationError: 'உங்கள் பகுதி மற்றும் நகரத்தை உள்ளிடவும் அல்லது GPS பயன்படுத்தவும்',

    shopHeading: 'உங்கள் கடையைப் பதிவு செய்யவும்',
    shopSubtitle: 'உங்கள் பழுதுபார்க்கும் வணிகத்தை விரிவுபடுத்தவும் & கழிவுகளை சேகரிக்கவும்',
    shopName: 'கடையின் பெயர்',
    shopNamePlaceholder: 'எ.கா: சென்னை சர்க்யூட் ஹப்',
    shopNameError: 'கடையின் பெயர் தேவை',
    ownerName: 'உரிமையாளர் பெயர்',
    ownerNamePlaceholder: 'எ.கா: ராஜேஷ் குமார்',
    ownerNameError: 'உரிமையாளர் பெயர் தேவை',
    shopCategory: 'கடை வகை',
    selectCategory: 'வகையைத் தேர்ந்தெடுக்கவும்',
    verifiedMobileNumber: 'சரிபார்க்கப்பட்ட தொலைபேசி எண்',
    mobileLockedBadge: 'OTP சரிபார்க்கப்பட்டது',
    shopAddress: 'கடை முகவரி',
    shopAddressPlaceholder: 'தெரு முகவரி & கடை எண்ணை உள்ளிடவும்',
    shopAddressError: 'கடை முகவரி தேவை',

    resumeTitle: 'பதிவைத் தொடரவா?',
    resumeDesc: 'இந்த தொலைபேசி எண்ணிற்கான பதிவு பாதியில் உள்ளது.',
    resumeContinue: 'தொடரவும்',
    startOver: 'புதிதாகத் தொடங்கவும்',

    back: 'பின்செல்க',
  },

  HI: {
    chooseLanguage: 'अपनी भाषा चुनें',
    selectLanguageSubtitle: 'ग्रीन लूप के साथ आगे बढ़ने के लिए अपनी पसंदीदा भाषा चुनें',
    continueBtn: 'आगे बढ़ें',

    welcomeBack: 'वापसी पर स्वागत है!',
    loginSubtitle: 'ग्रीन लूप में जारी रखने के लिए लॉगिन करें',
    phonePlaceholder: 'फ़ोन नंबर दर्ज करें',
    sendOtp: 'OTP भेजें',
    sendingOtp: 'OTP भेजा जा रहा है...',
    orContinueWith: 'या इसके साथ जारी रखें',
    googleLogin: 'Google के साथ जारी रखें',
    appleLogin: 'Apple के साथ जारी रखें',
    noAccountPrompt: 'खाता नहीं है?',
    signUpLink: 'साइन अप करें',
    invalidPhoneError: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (उदा: 9876543210)',

    enterOtp: 'OTP दर्ज करें',
    otpSentTo: 'हमने 6 अंकों का कोड भेजा है:',
    resendIn: 'OTP पुनः भेजें',
    didntReceive: 'कोड नहीं मिला?',
    resendOtp: 'OTP पुनः भेजें',
    verifying: 'OTP सत्यापित किया जा रहा है...',
    otpInvalidError: 'गलत OTP. कृपया कोड की जांच करें और पुनः प्रयास करें।',
    otpExpiredError: 'यह OTP समाप्त हो गया है। कृपया नया OTP अनुरोध करें।',
    otpRateLimitError: 'बहुत अधिक OTP अनुरोध। कृपया प्रतीक्षा करें और पुनः प्रयास करें।',
    otpProviderError: 'OTP सेवा अस्थायी रूप से अनुपलब्ध है। कृपया बाद में पुनः प्रयास करें।',
    otpResentSuccess: 'एक नया OTP भेज दिया गया है।',
    otpRequiredError: 'कृपया OTP के सभी 6 अंक दर्ज करें।',
    otpSuccess: 'OTP सफलतापूर्वक सत्यापित हुआ!',

    selectAccountType: 'खाते का प्रकार चुनें',
    selectRoleSubtitle: 'सर्कुलर इकोनॉमी में अपनी भूमिका चुनें',
    citizenTitle: 'नागरिक (CITIZEN)',
    citizenDesc: 'रीसायकल करें, कमाएं, प्रभाव बनाएं',
    shopTitle: 'स्थानीय दुकान (LOCAL SHOP)',
    shopDesc: 'एकत्र करें, मरम्मत करें, अधिक कमाएं',

    citizenHeading: 'नागरिक खाता बनाएं',
    citizenSubtitle: 'ई-कचरा रीसायकल करें और Green Coins अर्जित करें',
    profilePhoto: 'प्रोफ़ाइल फ़ोटो (वैकल्पिक)',
    camera: 'फ़ोटो लें',
    gallery: 'फ़ोटो अपलोड करें',
    skip: 'अभी छोड़ें',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
    fullNameError: 'पूरा नाम कम से कम 3 अक्षरों का होना चाहिए',
    emailOptional: 'ईमेल पता (वैकल्पिक)',
    emailPlaceholder: 'उदा: yourname@example.com',
    emailError: 'कृपया एक वैध ईमेल प्रारूप दर्ज करें',
    password: 'पासवर्ड',
    passwordPlaceholder: 'सुरक्षित पासवर्ड बनाएं',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'पासवर्ड पुनः दर्ज करें',
    passwordMismatchError: 'पासवर्ड मेल नहीं खाते',
    passReqLength: '8+ अक्षर',
    passReqUpper: 'बड़ा अक्षर (A-Z)',
    passReqLower: 'छोटा अक्षर (a-z)',
    passReqNumber: 'संख्या (0-9)',
    passReqSpecial: 'विशेष वर्ण (@$!%*?&)',
    area: 'क्षेत्र / मोहल्ला',
    areaPlaceholder: 'उदा: गिंडी, वेलाचेरी',
    city: 'शहर',
    cityPlaceholder: 'उदा: चेन्नई',
    landmarkOptional: 'लैंडमार्क (वैकल्पिक)',
    landmarkPlaceholder: 'उदा: मेट्रो स्टेशन के पास',
    gpsSectionTitle: 'GPS स्थान',
    gpsSectionDesc: 'आस-पास की दुकानों और रीसाइक्लिंग केंद्रों को आपको खोजने में मदद करता है',
    useCurrentLocation: 'वर्तमान स्थान का उपयोग करें',
    locating: 'GPS स्थान प्राप्त किया जा रहा है...',
    locationAcquired: 'GPS स्थान सफलतापूर्वक प्राप्त हुआ',
    chooseOnMap: 'मानचित्र पर चुनें',
    locationError: 'कृपया अपना क्षेत्र और शहर निर्दिष्ट करें या GPS का उपयोग करें',

    shopHeading: 'अपनी दुकान पंजीकृत करें',
    shopSubtitle: 'अपने मरम्मत व्यवसाय का विस्तार करें और ई-कचरा एकत्र करें',
    shopName: 'दुकान का नाम',
    shopNamePlaceholder: 'उदा: चेन्नई सर्किट हब',
    shopNameError: 'दुकान का नाम आवश्यक है',
    ownerName: 'मालिक का नाम',
    ownerNamePlaceholder: 'उदा: राजेश कुमार',
    ownerNameError: 'मालिक का नाम आवश्यक है',
    shopCategory: 'दुकान की श्रेणी',
    selectCategory: 'श्रेणी चुनें',
    verifiedMobileNumber: 'सत्यापित मोबाइल नंबर',
    mobileLockedBadge: 'OTP सत्यापित और लॉक किया गया',
    shopAddress: 'दुकान का पता',
    shopAddressPlaceholder: 'सड़क का पता और दुकान नंबर दर्ज करें',
    shopAddressError: 'दुकान का पता आवश्यक है',

    resumeTitle: 'पंजीकरण फिर से शुरू करें?',
    resumeDesc: 'इस फ़ोन नंबर के लिए अधूरा पंजीकरण उपलब्ध है।',
    resumeContinue: 'वहीं से जारी रखें',
    startOver: 'नए सिरे से शुरू करें',

    back: 'पीछे',
  },

  ML: {
    chooseLanguage: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    selectLanguageSubtitle: 'തുടരുന്നതിന് നിങ്ങളുടെ ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുക്കുക',
    continueBtn: 'തുടരുക',

    welcomeBack: 'സ്വാഗതം!',
    loginSubtitle: 'തുടരുന്നതിന് ഗ്രീൻ ലൂപ്പിലേക്ക് ലോഗിൻ ചെയ്യുക',
    phonePlaceholder: 'ഫോൺ നമ്പർ നൽകുക',
    sendOtp: 'OTP അയയ്ക്കുക',
    sendingOtp: 'OTP അയയ്ക്കുന്നു...',
    orContinueWith: 'അല്ലെങ്കിൽ ഇതുവഴി തുടരുക',
    googleLogin: 'Google ഉപയോഗിച്ച് തുടരുക',
    appleLogin: 'Apple ഉപയോഗിച്ച് തുടരുക',
    noAccountPrompt: 'അക്കൗണ്ട് ഇല്ലേ?',
    signUpLink: 'സൈൻ അപ്പ് ചെയ്യുക',
    invalidPhoneError: 'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക (ഉദാ: 9876543210)',

    enterOtp: 'OTP നൽകുക',
    otpSentTo: '6 അക്ക കോഡ് അയച്ചിരിക്കുന്നു:',
    resendIn: 'OTP വീണ്ടും അയക്കുക',
    didntReceive: 'കോഡ് ലഭിച്ചില്ലേ?',
    resendOtp: 'OTP വീണ്ടും അയക്കുക',
    verifying: 'പരിശോധിക്കുന്നു...',
    otpInvalidError: 'തെറ്റായ OTP. കോഡ് പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.',
    otpExpiredError: 'ഈ OTP കാലഹരണപ്പെട്ടു. ദയവായി പുതിയ OTP അഭ്യർത്ഥിക്കുക.',
    otpRateLimitError: 'കൂടുതൽ OTP അഭ്യർത്ഥനകൾ. ദയവായി കാത്തിരുന്ന് വീണ്ടും ശ്രമിക്കുക.',
    otpProviderError: 'OTP സേവനം താൽക്കാലികമായി ലഭ്യമല്ല. ദയവായി പിന്നീട് ശ്രമിക്കുക.',
    otpResentSuccess: 'ഒരു പുതിയ OTP അയച്ചിരിക്കുന്നു.',
    otpRequiredError: 'എല്ലാ 6 അക്കങ്ങളും നൽകുക.',
    otpSuccess: 'OTP വിജയകരമായി പരിശോധിച്ചു!',

    selectAccountType: 'അക്കൗണ്ട് തരം തിരഞ്ഞെടുക്കുക',
    selectRoleSubtitle: 'നിങ്ങളുടെ പങ്കാളിത്ത രീതി തിരഞ്ഞെടുക്കുക',
    citizenTitle: 'പൗരൻ (CITIZEN)',
    citizenDesc: 'റീസൈക്കിൾ ചെയ്യുക, സമ്പാദിക്കുക, മാറ്റമുണ്ടാക്കുക',
    shopTitle: 'പ്രാദേശിക കട (LOCAL SHOP)',
    shopDesc: 'ശേഖരിക്കുക, നന്നാക്കുക, കൂടുതൽ നേടുക',

    citizenHeading: 'പൗര അക്കൗണ്ട് സൃഷ്ടിക്കുക',
    citizenSubtitle: 'ഇ-മാലിന്യം റീസൈക്കിൾ ചെയ്ത് Green Coins നേടുക',
    profilePhoto: 'പ്രൊഫൈൽ ചിത്രം (നിർബന്ധമില്ല)',
    camera: 'ഫോട്ടോ എടുക്കുക',
    gallery: 'ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക',
    skip: 'ഇപ്പോൾ ഒഴിവാക്കുക',
    fullName: 'പൂർണ്ണ പേര്',
    fullNamePlaceholder: 'നിങ്ങളുടെ പൂർണ്ണ പേര് നൽകുക',
    fullNameError: 'പേരിൽ കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ വേണം',
    emailOptional: 'ഇമെയിൽ വിലാസം (നിർബന്ധമില്ല)',
    emailPlaceholder: 'ഉദാ: yourname@example.com',
    emailError: 'സാധുവായ ഇമെയിൽ വിലാസം നൽകുക',
    password: 'പാസ്‌വേഡ്',
    passwordPlaceholder: 'സുരക്ഷിതമായ പാസ്‌വേഡ് സൃഷ്ടിക്കുക',
    confirmPassword: 'പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക',
    confirmPasswordPlaceholder: 'പാസ്‌വേഡ് വീണ്ടും നൽകുക',
    passwordMismatchError: 'പാസ്‌വേഡുകൾ പൊരുത്തപ്പെടുന്നില്ല',
    passReqLength: '8+ അക്ഷരങ്ങൾ',
    passReqUpper: 'വലിയ അക്ഷരം (A-Z)',
    passReqLower: 'ചെറിയ അക്ഷരം (a-z)',
    passReqNumber: 'നമ്പർ (0-9)',
    passReqSpecial: 'പ്രത്യേക ചിഹ്നം (@$!%*?&)',
    area: 'പ്രദേശം / സ്ഥലം',
    areaPlaceholder: 'ഉദാ: ഗിണ്ടി, വേളച്ചേരി',
    city: 'നഗരം',
    cityPlaceholder: 'ഉദാ: ചെന്നൈ',
    landmarkOptional: 'അടയാളം (നിർബന്ധമില്ല)',
    landmarkPlaceholder: 'ഉദാ: മെട്രോ സ്റ്റേഷന് സമീപം',
    gpsSectionTitle: 'GPS ലൊക്കേഷൻ',
    gpsSectionDesc: 'അടുത്തുള്ള ഷോപ്പുകൾക്ക് നിങ്ങളെ കണ്ടെത്താൻ സഹായിക്കുന്നു',
    useCurrentLocation: 'നിലവിലെ ലൊക്കേഷൻ ഉപയോഗിക്കുക',
    locating: 'ലൊക്കേഷൻ കണ്ടെത്തുന്നു...',
    locationAcquired: 'ലൊക്കേഷൻ വിജയകരമായി ലഭിച്ചു',
    chooseOnMap: 'മാപ്പിൽ തിരഞ്ഞെടുക്കുക',
    locationError: 'നിങ്ങളുടെ പ്രദേശവും നഗരവും നൽകുക അല്ലെങ്കിൽ GPS ഉപയോഗിക്കുക',

    shopHeading: 'നിങ്ങളുടെ കട രജിസ്റ്റർ ചെയ്യുക',
    shopSubtitle: 'നിങ്ങളുടെ റിപ്പയർ ബിസിനസ്സ് വിപുലീകരിക്കുക',
    shopName: 'കടയുടെ പേര്',
    shopNamePlaceholder: 'ഉദാ: ചെന്നൈ സർക്യൂട്ട് ഹബ്ബ്',
    shopNameError: 'കടയുടെ പേര് നൽകണം',
    ownerName: 'ഉടമയുടെ പേര്',
    ownerNamePlaceholder: 'ഉദാ: രാജേഷ് കുമാർ',
    ownerNameError: 'ഉടമയുടെ പേര് നൽകണം',
    shopCategory: 'കടയുടെ തരം',
    selectCategory: 'വിഭാഗം തിരഞ്ഞെടുക്കുക',
    verifiedMobileNumber: 'സ്ഥിരീകരിച്ച മൊബൈൽ നമ്പർ',
    mobileLockedBadge: 'OTP പരിശോധിച്ചുറപ്പിച്ചു',
    shopAddress: 'കടയുടെ വിലാസം',
    shopAddressPlaceholder: 'വിലാസവും കട നമ്പറും നൽകുക',
    shopAddressError: 'കടയുടെ വിലാസം നൽകണം',

    resumeTitle: 'രജിസ്ട്രേഷൻ തുടരണോ?',
    resumeDesc: 'ഈ ഫോൺ നമ്പറിന് അപൂർണ്ണമായ രജിസ്ട്രേഷൻ ഉണ്ട്.',
    resumeContinue: 'തുടരുക',
    startOver: 'ആദ്യം മുതൽ തുടങ്ങുക',

    back: 'തിരികെ',
  },

  KN: {
    chooseLanguage: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    selectLanguageSubtitle: 'ಗ್ರೀನ್ ಲೂಪ್ ಮುಂದುವರಿಸಲು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    continueBtn: 'ಮುಂದುವರಿಸಿ',

    welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ!',
    loginSubtitle: 'ಮುಂದುವರಿಯಲು ಲಾಗಿನ್ ಮಾಡಿ',
    phonePlaceholder: 'ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
    sendOtp: 'OTP ಕಳುಹಿಸಿ',
    sendingOtp: 'OTP ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
    orContinueWith: 'ಅಥವಾ ಇದರೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ',
    googleLogin: 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ',
    appleLogin: 'Apple ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ',
    noAccountPrompt: 'ಖಾತೆ ಇಲ್ಲವೇ?',
    signUpLink: 'ಸೈನ್ ಅಪ್ ಮಾಡಿ',
    invalidPhoneError: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (ಉದಾ: 9876543210)',

    enterOtp: 'OTP ನಮೂದಿಸಿ',
    otpSentTo: '6 ಅಂಕಿಯ ಕೋಡ್ ಕಳುಹಿಸಲಾಗಿದೆ:',
    resendIn: 'OTP ಮರುಕಳುಹಿಸಿ',
    didntReceive: 'ಕೋಡ್ ಬಂದಿಲ್ಲವೇ?',
    resendOtp: 'OTP ಮರುಕಳುಹಿಸಿ',
    verifying: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    otpInvalidError: 'ತಪ್ಪಾದ OTP. ಕೋಡ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    otpExpiredError: 'ಈ OTP ಅವಧಿ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಹೊಸ OTP ವಿನಂತಿಸಿ.',
    otpRateLimitError: 'ಹೆಚ್ಚಿನ OTP ವಿನಂತಿಗಳು. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    otpProviderError: 'OTP ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.',
    otpResentSuccess: 'ಹೊಸ OTP ಕಳುಹಿಸಲಾಗಿದೆ.',
    otpRequiredError: 'ಎಲ್ಲಾ 6 ಅಂಕಿಗಳನ್ನು ನಮೂದಿಸಿ.',
    otpSuccess: 'OTP ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ!',

    selectAccountType: 'ಖಾತೆ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    selectRoleSubtitle: 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    citizenTitle: 'ನಾಗರಿಕ (CITIZEN)',
    citizenDesc: 'ಮರುಬಳಕೆ ಮಾಡಿ, ಗಳಿಸಿ, ಪ್ರಭಾವ ಬೀರಿ',
    shopTitle: 'ಸ್ಥಳೀಯ ಅಂಗಡಿ (LOCAL SHOP)',
    shopDesc: 'ಸಂಗ್ರಹಿಸಿ, ದುರಸ್ತಿ ಮಾಡಿ, ಹೆಚ್ಚು ಗಳಿಸಿ',

    citizenHeading: 'ನಾಗರಿಕ ಖಾತೆಯನ್ನು ರಚಿಸಿ',
    citizenSubtitle: 'ಇ-ತ್ಯಾಜ್ಯ ಮರುಬಳಕೆ ಮಾಡಿ Green Coins ಗಳಿಸಿ',
    profilePhoto: 'ಪ್ರೊಫೈಲ್ ಫೋಟೋ (ಐಚ್ಛಿಕ)',
    camera: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    gallery: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    skip: 'ಈಗ ಬಿಟ್ಟುಬಿಡಿ',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    fullNamePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    fullNameError: 'ಹೆಸರು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು',
    emailOptional: 'ಇಮೇಲ್ ವಿಳಾಸ (ಐಚ್ಛಿಕ)',
    emailPlaceholder: 'ಉದಾ: yourname@example.com',
    emailError: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ನಮೂದಿಸಿ',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    passwordPlaceholder: 'ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ',
    confirmPassword: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
    confirmPasswordPlaceholder: 'ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಮರುನಮೂದಿಸಿ',
    passwordMismatchError: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ',
    passReqLength: '8+ ಅಕ್ಷರಗಳು',
    passReqUpper: 'ದೊಡ್ಡ ಅಕ್ಷರ (A-Z)',
    passReqLower: 'ಸಣ್ಣ ಅಕ್ಷರ (a-z)',
    passReqNumber: 'ಸಂಖ್ಯೆ (0-9)',
    passReqSpecial: 'ವಿಶೇಷ ಅಕ್ಷರ (@$!%*?&)',
    area: 'ಪ್ರದೇಶ / ಬಡಾವಣೆ',
    areaPlaceholder: 'ಉದಾ: ಗಿಂಡಿ, ವೇಲಾಚೇರಿ',
    city: 'ನಗರ',
    cityPlaceholder: 'ಉದಾ: ಚೆನ್ನೈ',
    landmarkOptional: 'ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ (ಐಚ್ಛಿಕ)',
    landmarkPlaceholder: 'ಉದಾ: ಮೆಟ್ರೋ ನಿಲ್ದಾಣದ ಹತ್ತಿರ',
    gpsSectionTitle: 'GPS ಸ್ಥಳ',
    gpsSectionDesc: 'ಹತ್ತಿರದ ಅಂಗಡಿಗಳು ನಿಮ್ಮನ್ನು ಸುಲಭವಾಗಿ ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ',
    useCurrentLocation: 'ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ',
    locating: 'ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
    locationAcquired: 'ಸ್ಥಳ ಯಶಸ್ವಿಯಾಗಿ ಪಡೆಯಲಾಗಿದೆ',
    chooseOnMap: 'ನಕ್ಷೆಯಲ್ಲಿ ಆಯ್ಕೆಮಾಡಿ',
    locationError: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರದೇಶ ಮತ್ತು ನಗರವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ GPS ಬಳಸಿ',

    shopHeading: 'ನಿಮ್ಮ ಅಂಗಡಿಯನ್ನು ನೋಂದಾಯಿಸಿ',
    shopSubtitle: 'ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ವಿಸ್ತರಿಸಿ ಮತ್ತು ತ್ಯಾಜ್ಯ ಸಂಗ್ರಹಿಸಿ',
    shopName: 'ಅಂಗಡಿಯ ಹೆಸರು',
    shopNamePlaceholder: 'ಉದಾ: ಚೆನ್ನೈ ಸರ್ಕ್ಯೂಟ್ ಹಬ್',
    shopNameError: 'ಅಂಗಡಿಯ ಹೆಸರು ಅಗತ್ಯವಿದೆ',
    ownerName: 'ಮಾಲೀಕರ ಹೆಸರು',
    ownerNamePlaceholder: 'ಉದಾ: ರಾಜೇಶ್ ಕುಮಾರ್',
    ownerNameError: 'ಮಾಲೀಕರ ಹೆಸರು ಅಗತ್ಯವಿದೆ',
    shopCategory: 'ಅಂಗಡಿ ವರ್ಗ',
    selectCategory: 'ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    verifiedMobileNumber: 'ದೃಢೀಕರಿಸಿದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    mobileLockedBadge: 'OTP ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    shopAddress: 'ಅಂಗಡಿ ವಿಳಾಸ',
    shopAddressPlaceholder: 'ವಿಳಾಸ ಮತ್ತು ಅಂಗಡಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
    shopAddressError: 'ಅಂಗಡಿ ವಿಳಾಸ ಅಗತ್ಯವಿದೆ',

    resumeTitle: 'ನೋಂದಣಿಯನ್ನು ಮುಂದುವರಿಸಬೇಕೇ?',
    resumeDesc: 'ಈ ಫೋನ್ ಸಂಖ್ಯೆಗೆ ಅಪೂರ್ಣ ನೋಂದಣಿ ಇದೆ.',
    resumeContinue: 'ಮುಂದುವರಿಸಿ',
    startOver: 'ಮೊದಲಿಂದ ಪ್ರಾರಂಭಿಸಿ',

    back: 'ಹಿಂದಕ್ಕೆ',
  },
  TE: {
    chooseLanguage: 'మీ భాషను ఎంచుకోండి',
    selectLanguageSubtitle: 'గ్రీన్ లూప్‌ను ఉపయోగించడానికి మీకు నచ్చిన భాషను ఎంచుకోండి',
    continueBtn: 'కొనసాగించండి',

    welcomeBack: 'పునఃస్వాగతం!',
    loginSubtitle: 'గ్రీన్ లూప్‌లోకి ప్రవేశించడానికి లాగిన్ చేయండి',
    phonePlaceholder: 'ఫోన్ నంబర్ నమోదు చేయండి',
    sendOtp: 'OTP పంపండి',
    sendingOtp: 'OTP పంపబడుతోంది...',
    orContinueWith: 'లేదా దీనితో కొనసాగించండి',
    googleLogin: 'Google తో కొనసాగించండి',
    appleLogin: 'Apple తో కొనసాగించండి',
    noAccountPrompt: 'ఖాతా లేదా?',
    signUpLink: 'సైన్ అప్ చేయండి',
    invalidPhoneError: 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి',

    enterOtp: 'OTP ని నమోదు చేయండి',
    otpSentTo: '6 అంకెల కోడ్ పంపబడింది:',
    resendIn: 'మళ్లీ పంపడానికి సమయం:',
    didntReceive: 'రాలేదా?',
    resendOtp: 'OTP ని మళ్లీ పంపండి',
    verifying: 'ధృవీకరిస్తోంది...',
    otpInvalidError: 'తప్పు OTP. కోడ్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
    otpExpiredError: 'ఈ OTP గడువు ముగిసింది. దయచేసి కొత్త OTP ని అభ్యర్థించండి.',
    otpRateLimitError: 'చాలా ఎక్కువ అభ్యర్థనలు. దయచేసి కొద్దిసేపు వేచి ఉండండి.',
    otpProviderError: 'OTP సేవ తాత్కాలికంగా అందుబాటులో లేదు.',
    otpResentSuccess: 'కొత్త OTP పంపబడింది.',
    otpRequiredError: 'దయచేసి OTP యొక్క మొత్తం 6 అంకెలను నమోదు చేయండి.',
    otpSuccess: 'OTP విజయవంతంగా ధృవీకరించబడింది!',

    selectAccountType: 'ఖాతా రకాన్ని ఎంచుకోండి',
    selectRoleSubtitle: 'మీరు సర్క్యులర్ ఎకానమీలో ఎలా పాల్గొనాలనుకుంటున్నారో ఎంచుకోండి',
    citizenTitle: 'పౌరుడు (CITIZEN)',
    citizenDesc: 'రీసైకిల్ చేయండి, సంపాదించండి, ప్రభావాన్ని చూపండి',
    shopTitle: 'స్థానిక దుకాణం (LOCAL SHOP)',
    shopDesc: 'సేకరించండి, రిపేర్ చేయండి, మరింత సంపాదించండి',

    citizenHeading: 'మీ పౌరుడి ఖాతాను సృష్టించండి',
    citizenSubtitle: 'ఇ-వ్యర్థాలను రీసైకిల్ చేయడానికి మరియు గ్రీన్ కాయిన్స్ సంపాదించడానికి మా కమ్యూనిటీలో చేరండి',
    profilePhoto: 'ప్రొఫైల్ ఫోటో (ఐచ్ఛికం)',
    camera: 'కెమెరా',
    gallery: 'గ్యాలరీ',
    skip: 'దాటవేయి',
    fullName: 'పూర్తి పేరు',
    fullNamePlaceholder: 'ఉదా: కార్తీక్ కుమార్',
    fullNameError: 'పూర్తి పేరు అవసరం (కనీసం 2 అక్షరాలు)',
    emailOptional: 'ఇమెయిల్ చిరునామా (ఐచ్ఛికం)',
    emailPlaceholder: 'you@example.com',
    emailError: 'దయచేసి సరైన ఇమెయిల్ చిరునామాను నమోదు చేయండి',
    password: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'కనీసం 8 అక్షరాలు',
    confirmPassword: 'పాస్‌వర్డ్‌ను నిర్ధారించండి',
    confirmPasswordPlaceholder: 'పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి',
    passwordMismatchError: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు',
    passReqLength: 'కనీసం 8 అక్షరాలు',
    passReqUpper: 'కనీసం ఒక పెద్ద అక్షరం (A-Z)',
    passReqLower: 'కనీసం ఒక చిన్న అక్షరం (a-z)',
    passReqNumber: 'కనీసం ఒక సంఖ్య (0-9)',
    passReqSpecial: 'కనీసం ఒక ప్రత్యేక అక్షరం (@$!%*?&#)',
    area: 'ప్రాంతం / వీధి / కాలనీ',
    areaPlaceholder: 'ఉదా: బంజారా హిల్స్',
    city: 'నగరం',
    cityPlaceholder: 'ఉదా: హైదరాబాద్',
    landmarkOptional: 'ల్యాండ్‌మార్క్ (ఐచ్ఛికం)',
    landmarkPlaceholder: 'ఉదా: మెట్రో స్టేషన్ సమీపంలో',
    gpsSectionTitle: 'ఖచ్చితమైన స్థానాన్ని గుర్తించండి',
    gpsSectionDesc: 'డోర్‌స్టెప్ పికప్‌ల కోసం మీ స్థానాన్ని పొందండి',
    useCurrentLocation: 'ప్రస్తుత స్థానాన్ని ఉపయోగించండి',
    locating: 'స్థానాన్ని కనుగొంటోంది...',
    locationAcquired: 'స్థానం విజయవంతంగా తీసుకోబడింది',
    chooseOnMap: 'మ్యాప్‌లో ఎంచుకోండి',
    locationError: 'స్థానాన్ని పొందలేకపోయాము. దయచేసి చిరునామాను నమోదు చేయండి.',

    shopHeading: 'స్థానిక సేకరణ కేంద్రాన్ని నమోదు చేయండి',
    shopSubtitle: 'పరిసరాల్లోని ఇ-వ్యర్థాలను సేకరించి బాధ్యతాయుతంగా రిపేర్ చేయండి',
    shopName: 'దుకాణం పేరు',
    shopNamePlaceholder: 'ఉదా: శ్రీ బాలాజీ ఎలక్ట్రానిక్స్',
    shopNameError: 'దుకాణం పేరు అవసరం',
    ownerName: 'యజమాని పేరు',
    ownerNamePlaceholder: 'ఉదా: రాజేష్ కుమార్',
    ownerNameError: 'యజమాని పేరు అవసరం',
    shopCategory: 'దుకాణ విభాగం',
    selectCategory: 'విభాగాన్ని ఎంచుకోండి',
    verifiedMobileNumber: 'ధృవీకరించిన మొబైల్ నంబర్',
    mobileLockedBadge: 'OTP ధృవీకరించబడింది',
    shopAddress: 'దుకాణం చిరునామా',
    shopAddressPlaceholder: 'పూర్తి చిరునామా మరియు షాప్ నంబర్',
    shopAddressError: 'దుకాణం చిరునామా అవసరం',

    resumeTitle: 'నమోదును కొనసాగించాలా?',
    resumeDesc: 'ఈ ఫోన్ నంబర్‌కు అసంపూర్ణ నమోదు ఉంది.',
    resumeContinue: 'కొనసాగించండి',
    startOver: 'మొదటి నుండి ప్రారంభించండి',

    back: 'వెనుకకు',
  },
} as any

export function getAuthTranslation(lang: any): AuthTranslations {
  const upper = String(lang || 'EN').toUpperCase()
  return (AUTH_TRANSLATIONS as any)[upper] || (AUTH_TRANSLATIONS as any).EN
}
