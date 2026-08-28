const fs = require('fs');
const files = [
  'src/screens/Payment/PaymentScreen.tsx',
  'src/screens/Tables/TablesScreen.tsx',
  'src/screens/staff/StaffScreen.tsx',
  'src/screens/staff/StaffPanelScreen.tsx',
  'src/screens/Order/OrderScreen.tsx',
  'src/screens/Login/LoginScreen.tsx',
  'src/screens/Dashboard/DashboardScreen.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Not found: ' + file);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  if (!content.includes('useNavigate')) {
    content = content.replace(/import React(.*?)from 'react';/, "import React$1from 'react';\nimport { useNavigate } from 'react-router-dom';");
  }
  
  // Replace useAppStore hooks getting setScreen
  content = content.replace(/const.*?setScreen.*?=.*?useAppStore.*?;/g, "const navigate = useNavigate();");
  
  // Replace setScreen('path') with navigate('/path')
  content = content.replace(/setScreen\('([^']+)'\)/g, "navigate('/$1')");
  
  // Handle LoginScreen nextScreen as any
  if (content.includes('setScreen(nextScreen as any)')) {
    content = content.replace(/setScreen\(nextScreen as any\)/g, "navigate('/' + nextScreen)");
  }

  // Handle OrderScreen prop type and usage
  content = content.replace(/setScreen: \(screen: string\) => void;/g, "navigate: (path: string) => void;");
  // Replace destructured props
  content = content.replace(/\bsetScreen\b(,| )/g, (match, p1) => {
    if (match === 'setScreen ') return match; // avoid generic matches if not careful, actually just use simple replace
    return 'navigate' + p1;
  });
  content = content.replace(/setScreen={setScreen}/g, "navigate={navigate}");
  // Also any remaining setScreen inside OrderScreen
  content = content.replace(/setScreen\(/g, "navigate(");

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
});
