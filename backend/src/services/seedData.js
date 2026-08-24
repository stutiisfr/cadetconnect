const bcrypt = require('bcryptjs');
const db = require('../db/database');

async function initSeedData() {
  const existingUsers = db.find('users');
  if (existingUsers.length > 0) {
    console.log('Database already initialized with seed data.');
    return;
  }

  console.log('Initializing CadetConnect realistic seed dataset...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('cadet123', salt);

  // 1. Users & Profiles
  // Cadet User: Rahul Das (SUO)
  const cadetUser = db.insert('users', {
    id: 'usr-cadet-rahul',
    email: 'rahul.das@cadetconnect.org',
    password: passwordHash,
    name: 'Rahul Das',
    username: 'rahul_das_suo',
    role: 'CADET',
    isVerified: true,
    verificationBadge: 'Verified Cadet',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    location: 'Cuttack, Odisha',
    bio: 'Senior Under Officer at 4 (O) Bn NCC. RDC 2025 Cadet. Passionate about Defence Leadership & Service.',
    phone: '+91 9876543210',
    gender: 'Male',
    dob: '2004-05-14',
    college: 'Ravenshaw University',
    course: 'B.Sc Physics (Hons)',
    year: '3rd Year'
  });

  db.insert('cadet_profiles', {
    id: 'cadet-prof-rahul',
    userId: cadetUser.id,
    directorate: 'Odisha Directorate',
    group: 'Cuttack Group',
    unit: '4 (O) Bn NCC',
    battalion: '4th Battalion',
    wing: 'Army Wing (SD)',
    regimentalNumber: 'OD/22/SD/A/104921', // PRIVATE, NEVER EXPOSED PUBLICLY
    rank: 'Senior Under Officer (SUO)',
    enrollmentYear: '2022',
    certificateStatus: 'B Certificate (Grade A), C Cert In-Progress',
    skills: ['Drill Instruction', 'Weapon Training (.22 Rifle)', 'Map Reading', 'Team Leadership', 'SSB OIR'],
    interests: ['Army Aviation', 'Military History', 'Obstacle Training', 'Cross Country Running']
  });

  // Visual Journey Timeline for Rahul
  const journeyEntries = [
    { year: '2022', title: 'Enrolled in 4 (O) Bn NCC', detail: 'Joined Army Wing SD Cadet roster at Ravenshaw University.', category: 'Enrollment' },
    { year: '2023', title: 'Combined Annual Training Camp (CATC)', detail: 'Awarded Best Cadet in Drill & Marksmanship.', category: 'Camp' },
    { year: '2024', title: 'Cleared NCC B-Certificate', detail: 'Secured Alpha (A) Grade in written and practical exams.', category: 'Certificate' },
    { year: '2024', title: 'Appointed Company Quarter Master Sergeant (CQMS)', detail: 'Took responsibility for unit stores & logistics.', category: 'Rank' },
    { year: '2025', title: 'Republic Day Camp (RDC 2025 - New Delhi)', detail: 'Marched at Kartavya Path; Prime Minister Banner contingent.', category: 'Achievement' },
    { year: '2026', title: 'Promoted to Senior Under Officer (SUO)', detail: 'Senior Cadet Officer heading unit training operations.', category: 'Rank' }
  ];
  journeyEntries.forEach(item => {
    db.insert('achievements', {
      userId: cadetUser.id,
      ...item
    });
  });

  // Aspirant User: Ananya Sharma
  const aspirantUser = db.insert('users', {
    id: 'usr-aspirant-ananya',
    email: 'ananya.sharma@cadetconnect.org',
    password: passwordHash,
    name: 'Ananya Sharma',
    username: 'ananya_defence',
    role: 'ASPIRANT',
    isVerified: true,
    verificationBadge: 'Verified Aspirant',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    location: 'Jaipur, Rajasthan',
    bio: 'CDS & AFCAT Aspirant. B.Tech CSE 2026. Target: Flying Branch Indian Air Force. Written cleared 2x, preparing for 4 AFSB Varanasi.',
    college: 'MNIT Jaipur',
    degree: 'B.Tech Computer Science',
    graduationYear: '2026'
  });

  db.insert('aspirant_profiles', {
    userId: aspirantUser.id,
    targetExams: ['CDS', 'AFCAT', 'SSB'],
    targetEntry: 'AFCAT (Flying) & CDS (OTA)',
    preferredService: 'Indian Air Force',
    prepLevel: 'Advanced (SSB Stage II & AFSB Prep)',
    skills: ['Aptitude & Spatial Reasoning', 'General Awareness', 'Aircraft Knowledge', 'Group Discussion', 'Public Speaking'],
    interests: ['Aviation Tech', 'Fitness Running', 'Current Affairs Quiz', 'Psychology']
  });

  // Veteran / Mentor User: Col. Vikram Rathore (Retd.)
  const mentorUser = db.insert('users', {
    id: 'usr-mentor-vikram',
    email: 'col.vikram@cadetconnect.org',
    password: passwordHash,
    name: 'Col. Vikram Rathore (Retd.)',
    username: 'col_vikram_rathore',
    role: 'MENTOR',
    isVerified: true,
    verificationBadge: 'Verified Veteran Mentor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    location: 'Dehradun, Uttarakhand',
    bio: 'Ex-Infantry Officer (21 Years Service). Former Interviewing Officer at 14 SSB Allahabad. Guiding Defence Aspirants & Cadets towards Officer Commission.',
    college: 'National Defence Academy (NDA 88th Course)',
    degree: 'M.Sc Defence Studies (DSSC Wellington)'
  });

  db.insert('mentor_profiles', {
    userId: mentorUser.id,
    expertise: ['SSB Personal Interview', 'GTO Strategy & Officer Like Qualities (OLQs)', 'TAT/WAT/SRT Psychology Analysis', 'Military Leadership'],
    experienceYears: '21 Years Active Service + 6 Years Mentorship',
    defenceBackground: 'Armoured Corps & Infantry Command',
    guidedCadetsCount: 140,
    rating: 4.95,
    sessionDurationMinutes: 45,
    languages: ['English', 'Hindi'],
    availability: ['Mon 17:00-19:00', 'Wed 17:00-19:00', 'Sat 10:00-13:00']
  });

  // Organization User: Odisha NCC Directorate
  const orgUser = db.insert('users', {
    id: 'usr-org-odisha',
    email: 'contact@odishancc.org',
    password: passwordHash,
    name: 'Odisha NCC Directorate',
    username: 'odisha_ncc_official',
    role: 'ORGANIZATION',
    isVerified: true,
    verificationBadge: 'Verified Organization',
    avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&auto=format&fit=crop&q=80',
    location: 'Bhubaneswar, Odisha',
    bio: 'Official State Directorate updates for Odisha NCC units, camp schedules, B & C certificate exam notices, and cadet achievements.',
    college: 'NCC HQ Bhubaneswar'
  });

  // Platform Admin User
  const adminUser = db.insert('users', {
    id: 'usr-admin-master',
    email: 'admin@cadetconnect.org',
    password: passwordHash,
    name: 'CadetConnect Moderation Desk',
    username: 'cadetconnect_admin',
    role: 'ADMIN',
    isVerified: true,
    verificationBadge: 'Verified Admin Desk',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    location: 'New Delhi, India',
    bio: 'Official Administrative and Verification Desk of CadetConnect Platform.'
  });

  // 2. Sample Feed Posts
  db.insert('posts', {
    id: 'post-101',
    authorId: cadetUser.id,
    authorName: cadetUser.name,
    authorRole: 'Senior Under Officer',
    authorAvatar: cadetUser.avatar,
    category: 'Camps',
    content: 'Reflecting on our 12-day Combined Annual Training Camp (CATC 2026). Early 0500 hrs roll calls, rifle drill precision, and obstacle course runs forged unmatched camaraderie among the 400 cadets of 4 (O) Bn. Discipline is not imposed; it is cultivated daily! 🇮🇳 #NCC #CadetLife #Discipline #YouthLeadership',
    mediaUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
    appreciationsCount: 142,
    commentsCount: 18,
    repostsCount: 9,
    savedCount: 24,
    tags: ['CATC2026', 'NCC', 'CampMemories', 'Leadership']
  });

  db.insert('posts', {
    id: 'post-102',
    authorId: mentorUser.id,
    authorName: mentorUser.name,
    authorRole: 'Ex-SSB Interviewing Officer',
    authorAvatar: mentorUser.avatar,
    category: 'Defence Preparation',
    content: 'Key advice for cadets and aspirants appearing for SSB Interview: The assessors are NOT looking for flawless actors. We look for authentic response under stress, clear reasoning ability, effective intelligence, and genuine empathy in group tasks. Focus on self-awareness before mastering interview tricks. What is your biggest challenge in Stage II?',
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop&q=80',
    appreciationsCount: 289,
    commentsCount: 45,
    repostsCount: 32,
    savedCount: 110,
    tags: ['SSBGuidance', 'DefenceMentorship', 'OLQ', 'CDSPrep']
  });

  db.insert('posts', {
    id: 'post-103',
    authorId: aspirantUser.id,
    authorName: aspirantUser.name,
    authorRole: 'CDS & AFCAT Aspirant',
    authorAvatar: aspirantUser.avatar,
    category: 'Study',
    content: 'Just published my quick revision cheat-sheet for CDS 1 2026 Physics & Defence Technology! Includes latest updates on Akash-NG, P-15B Destroyers, Tejas Mk1A, and Missile Systems. Available in the Defence Knowledge Hub! 📘 Check it out and let me know your thoughts.',
    mediaUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&auto=format&fit=crop&q=80',
    appreciationsCount: 95,
    commentsCount: 12,
    repostsCount: 7,
    savedCount: 68,
    tags: ['CDSNotes', 'DefenceTech', 'StudyNotes', 'KnowledgeHub']
  });

  // 3. Defence Knowledge Hub Notes & Official Handbooks
  db.insert('notes', {
    id: 'note-200-hndbk1',
    title: "NCC Cadet's Hand Book — Common Subjects All Wings (JD/JW & SD/SW)",
    authorId: orgUser.id,
    authorName: 'NCC Directorate Bhubaneswar',
    category: 'NCC',
    subject: 'Official Common Subjects',
    description: 'Official comprehensive textbook for Junior & Senior Division cadets. Covers NCC General & Motto, National Integration, Foot & Rifle Drill, Weapon Training (.22 & SLR/INSAS), Leadership Traits, Civil Affairs & Disaster Management, Health & Hygiene, Adventure Activities, Environment & Ecology, Self Defence, and Posture Training.',
    downloadUrl: '#',
    rating: 5.0,
    downloadsCount: 1450,
    fileSize: '18.5 MB',
    format: 'PDF',
    isOfficialHandbook: true
  });

  db.insert('notes', {
    id: 'note-200-hndbk2',
    title: "NCC Cadet's Hand Book (Army) — Specialised Subjects (SD/SW)",
    authorId: adminUser.id,
    authorName: 'Director General National Cadet Corps (HQ DG NCC)',
    category: 'NCC',
    subject: 'Army Specialised Subjects',
    description: 'Official specialized subject textbook for Army Wing Senior Division/Wing cadets. Chapters include: Armed Forces & CAPF (Organization & Ranks), Map Reading & Conventional Signs, Field Craft & Battle Craft (FC & BC), Infantry Battalion Organisation & Weapons, Military History & Param Vir Chakra Awardees, and Military Communication & RT Procedures.',
    downloadUrl: '#',
    rating: 5.0,
    downloadsCount: 1890,
    fileSize: '14.2 MB',
    format: 'PDF',
    isOfficialHandbook: true
  });

  db.insert('notes', {
    id: 'note-200-hndbk3',
    title: "NCC Cadet's Hand Book (Army) — Common Subjects (SD/SW)",
    authorId: adminUser.id,
    authorName: 'Director General National Cadet Corps (HQ DG NCC)',
    category: 'NCC',
    subject: 'Army Common Subjects',
    description: 'Revised official common subject textbook by HQ DG NCC. Chapters cover: NCC Aims & Incentives, National Integration & Threats to Security, Foot & Ceremonial Drill, Weapon Training & .22 Firing, Personality Development & Life Skills, Leadership Capsule & Case Studies, Disaster Management, Social Service (Swachh Bharat, Beti Bachao), and Health & Hygiene.',
    downloadUrl: '#',
    rating: 5.0,
    downloadsCount: 2100,
    fileSize: '16.8 MB',
    format: 'PDF',
    isOfficialHandbook: true
  });

  db.insert('notes', {
    id: 'note-201',
    title: 'Comprehensive CDS & NDA General Knowledge Digest 2026',
    authorId: aspirantUser.id,
    authorName: aspirantUser.name,
    category: 'CDS',
    subject: 'Current Affairs & Defence Tech',
    description: 'Detailed 40-page notes covering Indian Armed Forces commands, joint exercises, missile systems, constitutional polity, and modern history timelines.',
    downloadUrl: '#',
    rating: 4.9,
    downloadsCount: 340,
    fileSize: '4.2 MB',
    format: 'PDF',
    downloads: 340
  });

  db.insert('notes', {
    id: 'note-202',
    title: 'SSB Psychology Test Blueprint: TAT, WAT, SRT & PPDT Strategy',
    authorId: mentorUser.id,
    authorName: mentorUser.name,
    category: 'SSB',
    subject: 'Psychological Tests',
    description: 'Official framework and practical sample sets for Thematic Apperception Test (TAT), Word Association Test (WAT), and Situation Reaction Test (SRT).',
    downloadUrl: '#',
    rating: 5.0,
    downloadsCount: 610,
    fileSize: '6.8 MB',
    format: 'PDF',
    downloads: 610
  });

  db.insert('notes', {
    id: 'note-203',
    title: 'NCC C-Certificate Examination Master Guide & Weapon Drill Manual',
    authorId: cadetUser.id,
    authorName: cadetUser.name,
    category: 'NCC',
    subject: 'NCC Specialised Subjects',
    description: 'Covers Map Reading, Field Craft & Battle Craft (FC/BC), .22 Deluxe Rifle technical specifications, Section Drill commands, and Military History syllabus.',
    downloadUrl: '#',
    rating: 4.85,
    downloadsCount: 520,
    fileSize: '8.1 MB',
    format: 'PDF',
    downloads: 520
  });

  // 4. Communities / Groups
  db.insert('communities', {
    id: 'comm-301',
    name: 'Odisha NCC Cadets & Alumni',
    category: 'NCC',
    description: 'Official networking hub for active cadets, SUOs, and ex-cadets of Odisha Directorate across Army, Navy, and Air Wings.',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80',
    membersCount: 1240,
    isPrivate: false,
    rules: 'Maintain decorum, verify NCC regimental details, respect senior cadets, no political spam.'
  });

  db.insert('communities', {
    id: 'comm-302',
    name: 'CDS 2026/2027 Aspirants Circle',
    category: 'Defence Preparation',
    description: 'Dedicated study group for Combined Defence Services Examination. Daily current affairs quiz, mock paper discussion, and SSB interview prep.',
    banner: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&auto=format&fit=crop&q=80',
    membersCount: 2850,
    isPrivate: false,
    rules: 'Focus strictly on CDS syllabus, daily notes sharing, and respectful peer feedback.'
  });

  db.insert('communities', {
    id: 'comm-303',
    name: 'SSB Officer Candidates Forum',
    category: 'SSB',
    description: 'Mentored community led by ex-SSB assessors. Peer mock PPDT sessions, GTO task analysis, and OIR practice tests.',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    membersCount: 1940,
    isPrivate: false,
    rules: 'Verified mentor presence. Constructive feedback only.'
  });

  // 5. Events / Camps
  db.insert('events', {
    id: 'evt-401',
    title: 'State Combined Annual Training Camp (CATC 2026)',
    category: 'NCC Camp',
    date: '2026-09-15',
    time: '06:00 AM - 06:00 PM',
    location: 'NCC Training Ground, Cuttack',
    organizer: '4 (O) Bn NCC',
    description: '10-Day intensive residential training camp covering obstacle course, range firing (.22 & 7.62mm SLR), tactical field craft, drill competitions, and cultural evening.',
    banner: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
    eligibility: 'Enrolled Senior Division (SD) and Senior Wing (SW) Cadets',
    participantsCount: 380,
    maxParticipants: 450
  });

  db.insert('events', {
    id: 'evt-402',
    title: 'Mastering SSB Stage II: Psychology & GTO Masterclass',
    category: 'SSB Workshop',
    date: '2026-08-30',
    time: '05:00 PM - 07:00 PM IST',
    location: 'CadetConnect Live Room / Online',
    organizer: 'Col. Vikram Rathore (Retd.)',
    description: 'Exclusive 2-hour interactive webinar breaking down TAT story writing patterns, Group Planning Exercises (GPE), Command Tasks, and Personal Interview pitfalls.',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop&q=80',
    eligibility: 'All Defence Aspirants & NCC Cadets',
    participantsCount: 420,
    maxParticipants: 500
  });

  // 6. 24h Stories
  db.insert('stories', {
    id: 'story-501',
    authorId: cadetUser.id,
    authorName: cadetUser.name,
    authorAvatar: cadetUser.avatar,
    mediaUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    caption: '0530 AM Morning PT & 5km Run complete! Speed: 21 mins 40 secs. Push-ups: 50. Discipline is a daily habit. 💪🇮🇳',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  });

  db.insert('stories', {
    id: 'story-502',
    authorId: aspirantUser.id,
    authorName: aspirantUser.name,
    authorAvatar: aspirantUser.avatar,
    mediaUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    caption: 'Mock CDS Mathematics Paper solved! Scored 78/100. Time management in Trigonometry & Mensuration improved! 📚✈️',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  });

  // 7. Videos
  db.insert('videos', {
    id: 'vid-601',
    title: 'Standard Rifle Drill Commands & Squad Marching Technique',
    category: 'NCC Training',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorId: cadetUser.id,
    authorName: cadetUser.name,
    duration: '04:15',
    viewsCount: 1420,
    likesCount: 230,
    description: 'Demonstration of Khula Line / Nikat Line Marching, Savdhan, Vishram, and Salami Shastr precision for republic day camp trials.'
  });

  db.insert('videos', {
    id: 'vid-602',
    title: 'SSB Group Obstacle Race (Snake Race) Strategy & Rules',
    category: 'SSB',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorId: mentorUser.id,
    authorName: mentorUser.name,
    duration: '08:30',
    viewsCount: 3890,
    likesCount: 680,
    description: 'Learn how to demonstrate team spirit, high energy, and rule compliance during the SSB GTO Group Obstacle Race.'
  });

  // 8. Defence Opportunities
  db.insert('opportunities', {
    id: 'opp-701',
    title: 'UPSC CDS II 2026 Official Notification',
    category: 'Official Defence Entry',
    source: 'UPSC Official / Indian Armed Forces',
    deadline: '2026-09-30',
    eligibility: 'Graduates in any discipline (IMA/OTA/INA) & B.E/B.Tech (AFA)',
    officialLink: 'https://upsc.gov.in',
    isVerified: true,
    description: 'Applications open for 459 vacancies across IMA Dehradun, INA Ezhimala, AFA Hyderabad, and OTA Chennai.'
  });

  db.insert('opportunities', {
    id: 'opp-702',
    title: 'National Defence Youth Leadership & Marksmanship Internship',
    category: 'NCC / Educational',
    source: 'Verified Defence Education Foundation',
    deadline: '2026-10-15',
    eligibility: 'NCC B/C Certificate Holders & Final Year Cadets',
    officialLink: 'https://cadetconnect.org/opps/youth-leadership',
    isVerified: true,
    description: 'Fully funded 3-week residential mentorship on adventure sports, drone operation, and strategic management.'
  });

  // 9. Sample Pending Verification Request for Admin Panel
  db.insert('verification_requests', {
    id: 'ver-801',
    userId: cadetUser.id,
    userName: cadetUser.name,
    userRole: 'CADET',
    regimentalNumber: 'OD/22/SD/A/104921',
    institution: 'Ravenshaw University',
    proofDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    submittedAt: new Date().toISOString()
  });

  console.log('Seed dataset initialized successfully.');
}

module.exports = { initSeedData };
