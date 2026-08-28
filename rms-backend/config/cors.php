<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5177',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5177',
    ],
    'allowed_origins_patterns' => [
        '#^http://localhost:517\d$#',
        '#^http://127\.0\.0\.1:517\d$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
