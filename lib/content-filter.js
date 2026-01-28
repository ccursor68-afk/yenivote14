// Content Filter - Bad Words & Sensitive Topics Filter
// Supports Turkish and English

// Turkish swear words and inappropriate content
const turkishBadWords = [
  // Küfürler (censored versions for code)
  'amk', 'aq', 'mk', 'mq', 'amq', 'amına', 'amina', 'amını', 'amini',
  'orospu', 'oç', 'oc', 'oç', 'piç', 'pic', 'pezevenk', 'gavat',
  'sikik', 'sik', 's1k', 's!k', 'sikeyim', 'sikerim', 'siktir', 'siktirgit',
  'göt', 'got', 'götün', 'gotun', 'götveren',
  'yarak', 'yarrak', 'yarrağ', 'yarra',
  'taşak', 'taşşak', 'daşşak',
  'meme', 'memeler', // context dependent but often misused
  'am', // standalone
  'döl', 'dol',
  'ibne', 'ibnelik', 'top', // derogatory
  'fahişe', 'kahpe', 'kaltak', 'şerefsiz', 'namussuz',
  'kodumun', 'kodumunun', 'anasını', 'anasini', 'ananı', 'anani',
  'babanı', 'babani', 'bacını', 'bacini',
  'puşt', 'dangalak', 'gerizekalı', 'gerzek', 'mal', 'salak', 'aptal',
  'hıyar', 'hiyar', 'bok', 'boktan', 'osur', 'ossurmak',
  'yavşak', 'şaban', 'ezik', 'loser', 'enayi',
  'otuzbir', '31', 'mastür', 'çek', // inappropriate context
  'porn', 'porno', 'seks', 'sex', 'xxx', 'nude', 'nsfw',
  // Variations and l33t speak
  '@m', '@mk', 's!kt!r', 'or0spu', '0rospu', 'p1c', 'g0t',
];

// Religious/sensitive terms (to keep platform neutral)
const sensitiveTurkishWords = [
  // Religious terms that might be used inappropriately
  'allah', 'muhammed', 'peygamber', 'kuran', 'cami', 'imam',
  'isa', 'hristiyan', 'kilise', 'yahudi', 'havra', 'sinagog',
  'budist', 'hindu', 'şeytan', 'seytan', 'cehennem', 'cennet',
  // Political sensitivity
  'atatürk', 'ataturk', 'erdoğan', 'erdogan', 'chp', 'akp', 'mhp',
  'pkk', 'terör', 'teror', 'terörist', 'terorist',
  // Ethnic slurs
  'kürt', 'kurt', 'çingene', 'cingene', 'arap', 'zenci',
];

// English bad words
const englishBadWords = [
  'fuck', 'fck', 'f*ck', 'f**k', 'fucker', 'fucking', 'fucked',
  'shit', 'sh!t', 'sh1t', 'shitty', 'bullshit',
  'ass', 'asshole', 'a$$', '@ss', 'arse',
  'bitch', 'b!tch', 'b1tch', 'bitches',
  'dick', 'd!ck', 'dicks', 'dickhead',
  'cock', 'c0ck', 'cocks',
  'pussy', 'puss', 'p*ssy',
  'cunt', 'c*nt',
  'whore', 'wh0re', 'slut', 'slag',
  'nigger', 'n!gger', 'n1gger', 'nigga',
  'faggot', 'fag', 'f@g',
  'retard', 'retarded',
  'porn', 'porno', 'xxx', 'nsfw', 'nude', 'naked', 'hentai',
  'cum', 'cumshot', 'jizz',
  'bastard', 'damn', 'dammit', 'crap', 'piss',
  'wanker', 'twat', 'bollocks',
];

// Combine all bad words
const allBadWords = [...new Set([
  ...turkishBadWords,
  ...englishBadWords
])];

// Sensitive words (warning only, not blocking)
const sensitiveWords = [...new Set([
  ...sensitiveTurkishWords
])];

// Normalize text for comparison (remove special chars, convert to lowercase)
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[!]/g, 'i')
    .replace(/[*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Check if text contains bad words
// DISABLED: Bad word filter deactivated per user request
export const checkBadWords = (text) => {
  // Always return false - filter disabled
  return { hasBadWords: false, foundWords: [] };
  
  /* ORIGINAL CODE - DISABLED
  if (!text) return { hasBadWords: false, foundWords: [] };
  
  const normalizedText = normalizeText(text);
  const words = normalizedText.split(/\s+/);
  const foundWords = [];

  // Check each word
  for (const word of words) {
    // Check exact match
    if (allBadWords.includes(word)) {
      foundWords.push(word);
      continue;
    }
    
    // Check if word contains bad word as substring
    for (const badWord of allBadWords) {
      if (badWord.length >= 3 && word.includes(badWord)) {
        foundWords.push(badWord);
        break;
      }
    }
  }

  // Also check the full text for combined words
  for (const badWord of allBadWords) {
    if (badWord.length >= 4 && normalizedText.includes(badWord) && !foundWords.includes(badWord)) {
      foundWords.push(badWord);
    }
  }

  return {
    hasBadWords: foundWords.length > 0,
    foundWords: [...new Set(foundWords)]
  };
  */
};

// Check if text contains sensitive words (warning only)
export const checkSensitiveWords = (text) => {
  if (!text) return { hasSensitiveWords: false, foundWords: [] };
  
  const normalizedText = normalizeText(text);
  const foundWords = [];

  for (const sensitiveWord of sensitiveWords) {
    if (normalizedText.includes(sensitiveWord)) {
      foundWords.push(sensitiveWord);
    }
  }

  return {
    hasSensitiveWords: foundWords.length > 0,
    foundWords: [...new Set(foundWords)]
  };
};

// Full content check
export const validateContent = (text) => {
  const badWordCheck = checkBadWords(text);
  const sensitiveCheck = checkSensitiveWords(text);

  return {
    isValid: !badWordCheck.hasBadWords,
    hasBadWords: badWordCheck.hasBadWords,
    hasSensitiveWords: sensitiveCheck.hasSensitiveWords,
    badWords: badWordCheck.foundWords,
    sensitiveWords: sensitiveCheck.foundWords,
    message: badWordCheck.hasBadWords 
      ? 'İçerik uygunsuz kelimeler içeriyor. Lütfen düzenleyin.'
      : sensitiveCheck.hasSensitiveWords 
        ? 'İçerik hassas kelimeler içeriyor. Devam etmek istiyor musunuz?'
        : null
  };
};

// Validate hostname or IP address
export const isValidHostnameOrIP = (value) => {
  if (!value || typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // IP address regex (IPv4)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Hostname regex (allows subdomains)
  const hostnameRegex = /^(?=.{1,253}$)(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)*(?!-)[a-zA-Z0-9-]{1,63}(?<!-)$/;
  
  // Simple domain check (at least one dot, valid TLD)
  const simpleDomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  
  return ipv4Regex.test(trimmed) || hostnameRegex.test(trimmed) || simpleDomainRegex.test(trimmed);
};

// Validate port number
export const isValidPort = (port) => {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
};

// Server form validation
export const validateServerForm = (form) => {
  const errors = {};

  // IP validation
  if (!form.ip) {
    errors.ip = 'Sunucu IP/hostname zorunludur';
  } else if (!isValidHostnameOrIP(form.ip)) {
    errors.ip = 'Geçerli bir IP adresi veya hostname girin';
  }

  // Port validation
  if (form.port && !isValidPort(form.port)) {
    errors.port = 'Port 1-65535 arasında olmalıdır';
  }

  // Name validation
  if (!form.name || form.name.trim().length < 3) {
    errors.name = 'Sunucu adı en az 3 karakter olmalıdır';
  } else if (form.name.trim().length > 50) {
    errors.name = 'Sunucu adı en fazla 50 karakter olabilir';
  } else {
    const nameCheck = checkBadWords(form.name);
    if (nameCheck.hasBadWords) {
      errors.name = 'Sunucu adı uygunsuz kelimeler içeriyor';
    }
  }

  // Short description validation
  if (!form.shortDescription || form.shortDescription.trim().length < 10) {
    errors.shortDescription = 'Kısa açıklama en az 10 karakter olmalıdır';
  } else if (form.shortDescription.trim().length > 150) {
    errors.shortDescription = 'Kısa açıklama en fazla 150 karakter olabilir';
  } else {
    const descCheck = checkBadWords(form.shortDescription);
    if (descCheck.hasBadWords) {
      errors.shortDescription = 'Açıklama uygunsuz kelimeler içeriyor';
    }
  }

  // Long description validation (optional)
  if (form.longDescription) {
    const longDescCheck = checkBadWords(form.longDescription);
    if (longDescCheck.hasBadWords) {
      errors.longDescription = 'Detaylı açıklama uygunsuz kelimeler içeriyor';
    }
  }

  // Game modes validation
  if (!form.gameModes || form.gameModes.length === 0) {
    errors.gameModes = 'En az 1 oyun modu seçmelisiniz';
  } else if (form.gameModes.length > 3) {
    errors.gameModes = 'En fazla 3 oyun modu seçebilirsiniz';
  }

  // Version validation
  if (!form.version) {
    errors.version = 'Minecraft versiyonu zorunludur';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  checkBadWords,
  checkSensitiveWords,
  validateContent,
  isValidHostnameOrIP,
  isValidPort,
  validateServerForm
};
