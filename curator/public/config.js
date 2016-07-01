// Legacy, according to initial spec
var META_OLD = {
    use: [true, false],
    quality: ['low', 'acceptable', 'good'],
    imageIssues: ['blurry', 'pixelated', 'noisy', 'contrast/brightness too low/high', 'resolution too low', 'other issues', 'OK'],
    horizontalAngle: ['full-frontal', 'three-quarters', 'side', 'reverse-three-quarters', 'back'],
    verticalAngle: ['straight', 'below', 'above'],
    exposure: [
        'completely covered, curve barely visible',
        'completely covered but prominent curve',
        'bra or bikini',
        'hand-bra or other cover, very covered and/or pushed up',
        'hand-bra or other cover, little or no support',
        'only nipples covered',
        'nipples visible but breast partially covered',
        'full disclosure'
    ],
    generalVisibility: [0, 1, 2]
};

// CASES WHICH STILL SEEM NOT TO BE COVERED:
// see-through
// shirt-lift (no nipples visible)
// bikini in place but untied
// covered by open-shirt only
// lying down...
// maybe we need this category: [straight (default), laying back, laying down, leaning forward, bent over]

var META = {
    use: [true, false],
    // lowQuality: [true, false],
    quality: ['OK', 'image size too small', 'quality too low'],
    // imageIssues: ['blurry', 'pixelated', 'noisy', 'contrast/brightness too low/high', 'resolution too low', 'other issues', 'none'],
    horizontalAngle: ['full-frontal', 'three-quarters', 'side', 'reverse-three-quarters', 'back'],
    // verticalAngle: ['straight', 'from below', 'from above'],
    exposure: [
        'not in the picture (body not shown)',
        'completely covered, curve barely visible',
        'completely covered but prominent curve',
        'bra or bikini',
        'hand-bra or other minor cover', // the model is not dressed anymore
        'full disclosure'
    ],
    pushUp: [true, false]
    // ,
    // generalVisibility: [0, 1, 2]
};

var META_DEFAULTS = {
    use: true,
    // lowQuality: false,
    quality: 'OK'//,
    // imageIssues: 'none',
    // verticalAngle: 'straight'
};
