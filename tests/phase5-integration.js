// Comprehensive Phase 5 Integration Test Suite
// Verifies Discovery API, Security, Skill Comparison, Filtering, and Privacy

const API_SERVER = 'http://localhost:5000/api';
const { compareSkills } = require('../client/src/utils/skillComparison.ts');
const { isSafeUrl } = require('../client/src/utils/internshipFormatters.ts');

let studentCookie = '';
let companyCookie = '';
let publishedInternshipId = '';

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  results.push(message);
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING PHASE 5 COMPREHENSIVE INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  // -------------------------------------------------------------------------
  // 1. AUTHENTICATION SETUP & SECURITY ROLES
  // -------------------------------------------------------------------------
  console.log('--- SECTION 1: AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---');

  // Test 1.1: Unauthenticated discovery list request returns 401
  const unauthListRes = await fetch(`${API_SERVER}/student/internships`);
  assert(unauthListRes.status === 401, 'Unauthenticated discovery list request returns 401');

  // Test 1.2: Unauthenticated discovery details request returns 401
  const unauthDetailRes = await fetch(`${API_SERVER}/student/internships/any-id`);
  assert(unauthDetailRes.status === 401, 'Unauthenticated discovery details request returns 401');

  // Login as student
  const studentLoginRes = await fetch(`${API_SERVER}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student_1791284992845@example.com', password: 'Password123!' })
  });
  assert(studentLoginRes.status === 200, 'Student login succeeds (200)');
  studentCookie = studentLoginRes.headers.get('set-cookie');

  // Login as company
  const companyLoginRes = await fetch(`${API_SERVER}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_company_step56@example.com', password: 'Password123!' })
  });
  assert(companyLoginRes.status === 200, 'Company login succeeds (200)');
  companyCookie = companyLoginRes.headers.get('set-cookie');

  // Test 1.3: Company role accessing student discovery list returns 403 Forbidden
  const companyDiscoveryRes = await fetch(`${API_SERVER}/student/internships`, {
    headers: { cookie: companyCookie }
  });
  assert(companyDiscoveryRes.status === 403, 'Company user cannot access student discovery API (403 Forbidden)');

  // Test 1.4: Student role attempting company internship creation returns 403 Forbidden
  const studentCreateRes = await fetch(`${API_SERVER}/company/internships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: studentCookie },
    body: JSON.stringify({ title: 'Unauthorized Creation Attempt' })
  });
  assert(studentCreateRes.status === 403, 'Student cannot modify or create company internships (403 Forbidden)');

  // -------------------------------------------------------------------------
  // 2. DISCOVERY API FILTERING, STATUS & PRIVACY
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 2: DISCOVERY API STATUS, FILTERING & PRIVACY ---');

  // Test 2.1: Student discovers published internships
  const discoveryListRes = await fetch(`${API_SERVER}/student/internships`, {
    headers: { cookie: studentCookie }
  });
  assert(discoveryListRes.status === 200, 'Student retrieves published internships (200)');
  const discoveryData = await discoveryListRes.json();
  assert(discoveryData.status === 'success', 'Response status is "success"');
  assert(Array.isArray(discoveryData.internships), 'Internships list is an array');
  assert(discoveryData.pagination && typeof discoveryData.pagination.total === 'number', 'Pagination metadata is present');

  // Test 2.2: Every returned internship must be strictly PUBLISHED
  const allPublished = discoveryData.internships.every(i => i.status === 'PUBLISHED');
  assert(allPublished, 'All returned internships have status "PUBLISHED" (DRAFT, CLOSED, ARCHIVED excluded)');

  // Test 2.3: Every returned internship with deadline must be active (>= now)
  const now = new Date();
  const allActiveDeadlines = discoveryData.internships.every(i => {
    if (!i.applicationDeadline) return true;
    return new Date(i.applicationDeadline) >= now;
  });
  assert(allActiveDeadlines, 'All returned internships have valid, unexpired deadlines');

  // Test 2.4: Privacy check - Company user credentials/passwords must NOT be exposed
  const noPrivateDataExposed = discoveryData.internships.every(i => {
    if (!i.company) return true;
    return i.company.password === undefined &&
           i.company.user === undefined &&
           i.company.userId === undefined;
  });
  assert(noPrivateDataExposed, 'Company private account data (password/userId) is not exposed');

  // Test 2.5: Search and combined filters
  const searchRes = await fetch(`${API_SERVER}/student/internships?search=Software&workType=HYBRID&page=1&limit=5`, {
    headers: { cookie: studentCookie }
  });
  assert(searchRes.status === 200, 'Combined search, workType, and pagination request succeeds');
  const searchData = await searchRes.json();
  assert(searchData.pagination.page === 1, 'Pagination page matches query');
  assert(searchData.pagination.limit === 5, 'Pagination limit matches query');

  // Store existing published internship ID
  if (discoveryData.internships.length > 0) {
    publishedInternshipId = discoveryData.internships[0].id;
    console.log(`  Identified published internship for details tests: ${publishedInternshipId}`);
  }

  // -------------------------------------------------------------------------
  // 3. INTERNSHIP DETAILS API & UNAVAILABLE 404 BEHAVIOR
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 3: INTERNSHIP DETAILS & 404 NOT FOUND HANDLING ---');

  if (publishedInternshipId) {
    const detailsRes = await fetch(`${API_SERVER}/student/internships/${publishedInternshipId}`, {
      headers: { cookie: studentCookie }
    });
    assert(detailsRes.status === 200, 'Published internship details request returns 200');
    const detailsData = await detailsRes.json();
    assert(detailsData.internship && detailsData.internship.id === publishedInternshipId, 'Details response contains matching internship ID');
    assert(Array.isArray(detailsData.internship.skills), 'Internship contains standardized skills list');
  }

  // Test 3.1: Non-existent ID returns 404
  const notFoundRes = await fetch(`${API_SERVER}/student/internships/nonexistent_dummy_id`, {
    headers: { cookie: studentCookie }
  });
  assert(notFoundRes.status === 404, 'Non-existent internship ID returns 404 Not Found');

  // Test 3.2: Draft internship ID returns 404
  const draftRes = await fetch(`${API_SERVER}/student/internships/intern_ui_4c54fba163`, {
    headers: { cookie: studentCookie }
  });
  assert(draftRes.status === 404, 'Draft internship ID returns 404 Not Found');

  // -------------------------------------------------------------------------
  // 4. SKILL COMPARISON PURE LOGIC & EDGE CASES
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 4: SKILL COMPARISON LOGIC & COVERAGE FORMULA ---');

  // Scenario 4.1: Partial Match (2 / 3 -> 67%)
  const case1 = compareSkills(
    [
      { skillId: 's1', name: 'React', type: 'REQUIRED' },
      { skillId: 's2', name: 'Git', type: 'REQUIRED' },
      { skillId: 's3', name: 'TypeScript', type: 'REQUIRED' },
      { skillId: 'p1', name: 'Docker', type: 'PREFERRED' },
    ],
    [{ id: 's1' }, { id: 's2' }]
  );
  assert(case1.matchedRequiredCount === 2, 'Case 1 matched required count is 2');
  assert(case1.totalRequired === 3, 'Case 1 total required count is 3');
  assert(case1.missingRequiredCount === 1, 'Case 1 missing required count is 1');
  assert(case1.coverageDisplay === '67%', 'Case 1 coverage displays 67%');
  assert(case1.totalPreferred === 1, 'Case 1 total preferred is 1');
  assert(case1.matchedPreferredCount === 0, 'Preferred skills excluded from required coverage calculation');

  // Scenario 4.2: Full Match (2 / 2 -> 100%)
  const case2 = compareSkills(
    [
      { skillId: 's1', name: 'React', type: 'REQUIRED' },
      { skillId: 's2', name: 'Git', type: 'REQUIRED' },
    ],
    [{ id: 's1' }, { id: 's2' }, { id: 's99' }]
  );
  assert(case2.matchedRequiredCount === 2 && case2.coverageDisplay === '100%', 'Case 2 full match is 2/2 (100%)');

  // Scenario 4.3: Zero Match (0 / 2 -> 0%)
  const case3 = compareSkills(
    [
      { skillId: 's1', name: 'React', type: 'REQUIRED' },
      { skillId: 's2', name: 'Git', type: 'REQUIRED' },
    ],
    [{ id: 's88' }]
  );
  assert(case3.matchedRequiredCount === 0 && case3.coverageDisplay === '0%', 'Case 3 zero match is 0/2 (0%)');

  // Scenario 4.4: Zero required skills (Coverage Not available, null percentage)
  const case4 = compareSkills(
    [
      { skillId: 'p1', name: 'TypeScript', type: 'PREFERRED' },
    ],
    [{ id: 'p1' }]
  );
  assert(case4.coverageDisplay === 'Not available', 'Case 4 zero required skills displays "Not available"');
  assert(case4.coveragePercentage === null, 'Case 4 coverage percentage is null');

  // -------------------------------------------------------------------------
  // 5. SAFE URL PROTOCOL VALIDATION
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 5: SAFE URL PROTOCOL VALIDATION ---');
  assert(isSafeUrl('https://example.com') === true, 'HTTPS url is valid');
  assert(isSafeUrl('http://example.com/about') === true, 'HTTP url is valid');
  assert(isSafeUrl('javascript:alert(1)') === false, 'javascript: url is safely blocked');
  assert(isSafeUrl('data:text/html,bad') === false, 'data: url is safely blocked');
  assert(isSafeUrl('') === false, 'Empty url is false');
  assert(isSafeUrl(null) === false, 'Null url is false');
  assert(isSafeUrl(undefined) === false, 'Undefined url is false');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${results.length} INTEGRATION TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
