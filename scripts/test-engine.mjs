import assert from 'node:assert';
import { validateAndSanitizeUrl } from '../src/lib/media/validator.ts';
import { platformRegistry } from '../src/lib/media/platforms.ts';
import { mediaAnalyzer } from '../src/lib/media/analyzer.ts';
import { verifyFormatBelongsToMedia } from '../src/lib/media/formats.ts';
import { downloadJobManager } from '../src/lib/media/job-manager.ts';
import { checkRateLimit } from '../src/lib/security/rate-limit.ts';

async function runTests() {
  console.log('🧪 Running y2matevideo.com Engine Test Suite...\n');

  // Test 1: URL Validation - Valid HTTPS URL
  {
    const valid = validateAndSanitizeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.domain, 'youtube.com');
    console.log('✓ Test 1 Passed: Valid HTTPS URL sanitization');
  }

  // Test 2: SSRF Defense - Block 127.0.0.1
  {
    try {
      validateAndSanitizeUrl('http://127.0.0.1/admin');
      assert.fail('Should have thrown SSRF error for 127.0.0.1');
    } catch (err) {
      assert.strictEqual(err.code, 'PRIVATE_CONTENT');
      console.log('✓ Test 2 Passed: SSRF defense blocked 127.0.0.1');
    }
  }

  // Test 3: SSRF Defense - Block Cloud Metadata IP 169.254.169.254
  {
    try {
      validateAndSanitizeUrl('http://169.254.169.254/latest/meta-data/');
      assert.fail('Should have thrown SSRF error for Cloud Metadata IP');
    } catch (err) {
      assert.strictEqual(err.code, 'PRIVATE_CONTENT');
      console.log('✓ Test 3 Passed: SSRF defense blocked 169.254.169.254');
    }
  }

  // Test 4: Platform Registry Detection
  {
    const provider = platformRegistry.getProviderForDomain('vimeo.com');
    assert.notStrictEqual(provider, null);
    assert.strictEqual(provider?.name, 'Vimeo');
    console.log('✓ Test 4 Passed: Platform registry detected Vimeo domain');
  }

  // Test 5: Media Extraction & Analysis
  {
    const result = await mediaAnalyzer.analyze('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.strictEqual(result.platform, 'YouTube');
    assert.strictEqual(Array.isArray(result.formats), true);
    assert.ok(result.formats.length > 0);
    console.log(`✓ Test 5 Passed: Analyzed YouTube video with ${result.formats.length} format options`);

    // Test 6: Strict Format Verification (Valid Format)
    const validFormatId = result.formats[0].id;
    const verified = verifyFormatBelongsToMedia(result, validFormatId);
    assert.strictEqual(verified.id, validFormatId);
    console.log('✓ Test 6 Passed: Format verification validated authentic formatId');

    // Test 7: Strict Format Verification (Reject Fake Format ID)
    try {
      verifyFormatBelongsToMedia(result, 'fake-hacker-format-999');
      assert.fail('Should have rejected unassociated format ID');
    } catch (err) {
      assert.strictEqual(err.code, 'INVALID_URL');
      console.log('✓ Test 7 Passed: Format verification rejected untrusted formatId');
    }

    // Test 8: Job Management & State Transitions
    const job = await downloadJobManager.createJob(result, verified);
    assert.strictEqual(job.mediaId, result.id);
    assert.ok(['QUEUED', 'PROCESSING'].includes(job.status));
    console.log(`✓ Test 8 Passed: Download job created (${job.id}) in active worker pipeline`);

    // Wait for async worker simulation to complete
    await new Promise((res) => setTimeout(res, 2500));
    const updatedJob = await downloadJobManager.getJob(job.id);
    if (updatedJob?.status !== 'COMPLETED') {
      console.error('Job Error:', updatedJob?.errorMessage || updatedJob?.errorCode);
    }
    assert.strictEqual(updatedJob?.status, 'COMPLETED');
    assert.strictEqual(updatedJob?.progress, 100);
    assert.ok(updatedJob?.downloadUrl);
    console.log(`✓ Test 9 Passed: Download job transitioned to COMPLETED (100%) with signed URL`);
  }

  // Test 10: Rate Limiting Engine
  {
    const clientKey = 'test_ip_123';
    const limitResult = checkRateLimit(clientKey, { limit: 2, windowMs: 10000 });
    assert.strictEqual(limitResult.allowed, true);
    checkRateLimit(clientKey, { limit: 2, windowMs: 10000 });
    const blocked = checkRateLimit(clientKey, { limit: 2, windowMs: 10000 });
    assert.strictEqual(blocked.allowed, false);
    assert.strictEqual(blocked.remaining, 0);
    console.log('✓ Test 10 Passed: Rate limiter enforced maximum request limits per window');
  }

  console.log('\n🎉 ALL 10 ENGINE TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Error:', err);
  process.exit(1);
});
