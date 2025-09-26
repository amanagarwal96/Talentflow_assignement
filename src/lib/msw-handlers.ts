// src/lib/msw-handlers.ts
import { http, HttpResponse } from 'msw';
import { db } from './database';
import { Job, PaginatedResponse, Candidate } from '../types';

const delay = (min = 200, max = 1200) =>
  new Promise((res) => setTimeout(res, Math.random() * (max - min) + min));

const maybeFail = (rate = 0.05) => Math.random() < rate;

export const handlers = [
  // ---------------- JOBS ----------------
  http.get('/api/jobs', async ({ request }) => {
    await delay();
    try {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status') || '';
      const tags = url.searchParams.getAll('tags');
      const page = Number(url.searchParams.get('page') || '1');
      const pageSize = Number(url.searchParams.get('pageSize') || '10');
      const sort = url.searchParams.get('sort') || 'order:asc';

      let jobs = await db.jobs.toArray();

      if (search) {
        jobs = jobs.filter((j) =>
          (j.title || '').toLowerCase().includes(search.toLowerCase())
        );
      }
      if (status) {
        jobs = jobs.filter((j) => j.status === status);
      }
      if (tags.length) {
        jobs = jobs.filter((j) => tags.some((t) => j.tags?.includes(t)));
      }

      const [field, dir] = sort.split(':');
      jobs.sort((a: any, b: any) => {
        const aVal = a[field];
        const bVal = b[field];
        if (dir === 'desc') return aVal < bVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
      });

      const total = jobs.length;
      const start = (page - 1) * pageSize;
      const pageData = jobs.slice(start, start + pageSize);

      const payload: PaginatedResponse<Job> = {
        data: pageData,
        page,
        pageSize,
        total,
      };
      return HttpResponse.json(payload);
    } catch (err) {
      console.error('/api/jobs error', err);
      return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay();
    if (maybeFail(0.05)) {
      return HttpResponse.json({ error: 'Simulated write error' }, { status: 500 });
    }
    const body = await request.json();
    const id = crypto.randomUUID();
    const count = await db.jobs.count();
    const job = {
      id,
      title: body.title || 'Untitled',
      slug: body.slug || `untitled-${id.substring(0, 6)}`,
      status: body.status || 'active',
      tags: body.tags || [],
      order: count + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.jobs.add(job);
    return HttpResponse.json(job, { status: 201 });
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay();
    if (maybeFail(0.05)) {
      return HttpResponse.json({ error: 'Simulated error' }, { status: 500 });
    }
    const { id } = params;
    const updates = await request.json();
    await db.jobs.update(id as string, { ...updates, updatedAt: new Date() });
    const updated = await db.jobs.get(id as string);
    return HttpResponse.json(updated);
  }),

  // ---------------- JOBS REORDER ----------------
  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await delay();
    const { id } = params;
    const body = await request.json().catch(() => ({}));

    if (body.order === undefined || body.order === null) {
      return HttpResponse.json({ error: 'Order is required' }, { status: 400 });
    }

    const toOrder = Number(body.order);
    const all = await db.jobs.orderBy('order').toArray();
    const movingIndex = all.findIndex((j) => j.id === id);
    if (movingIndex === -1) return HttpResponse.json({ error: 'Job not found' }, { status: 404 });

    const moving = all.splice(movingIndex, 1)[0];

    let insertAt = all.findIndex((j) => j.order >= toOrder);
    if (insertAt === -1) insertAt = all.length;
    all.splice(insertAt, 0, moving);

    for (let i = 0; i < all.length; i++) {
      all[i].order = i + 1;
      all[i].updatedAt = new Date();
      await db.jobs.put(all[i]);
    }

    const updated = await db.jobs.get(id as string);
    return HttpResponse.json(updated, { status: 200 });
  }),

  // ---------------- CANDIDATES ----------------
  http.get('/api/candidates', async ({ request }) => {
    await delay();
    const url = new URL(request.url);

    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const jobId = url.searchParams.get('jobId') || '';
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '20');

    let candidates = await db.candidates.toArray();

    if (search) {
      candidates = candidates.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (stage) {
      candidates = candidates.filter(c => c.stage === stage);
    }
    if (jobId) {
      candidates = candidates.filter(c => c.jobId === jobId);
    }

    const total = candidates.length;
    const start = (page - 1) * pageSize;
    const pageData = candidates.slice(start, start + pageSize);

    return HttpResponse.json({
      data: pageData,
      page,
      pageSize,
      total,
    });
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await delay();
    const { id } = params;
    
    const candidate = await db.candidates.get(id as string);
    
    if (!candidate) {
      console.log('MSW: Candidate not found with ID:', id);
      console.log('MSW: Total candidates in DB:', await db.candidates.count());
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    console.log('MSW: Found candidate:', candidate.name, 'with ID:', candidate.id);
    return HttpResponse.json(candidate);
  }),

  http.post('/api/candidates', async ({ request }) => {
    await delay();
    const body = await request.json();
    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      jobId: body.jobId,
      stage: 'applied',
      createdAt: new Date(),
    };
    await db.candidates.add(candidate);
    return HttpResponse.json(candidate, { status: 201 });
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await delay();
    const updates = await request.json();
    await db.candidates.update(params.id as string, updates);
    const updated = await db.candidates.get(params.id as string);
    return HttpResponse.json(updated);
  }),

  // ---------------- CANDIDATE TIMELINE ----------------
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay();
    const { id } = params;
    const timeline = await db.timelines
      .where('candidateId')
      .equals(id as string)
      .sortBy('timestamp');

    return HttpResponse.json(timeline);
  }),

  http.post('/api/candidates/reorder', async ({ request }) => {
    await delay();
    const updates: { id: string; stage: string }[] = await request.json();

    for (const { id, stage } of updates) {
      await db.candidates.update(id, { stage, updatedAt: new Date() as any });
      await db.timelines.add({
        id: crypto.randomUUID(),
        candidateId: id,
        timestamp: new Date(),
        fromStage: null,
        toStage: stage,
        notes: 'Stage updated via reorder'
      } as any);
    }

    return HttpResponse.json({ success: true });
  }),

  // ---------------- ASSESSMENTS ----------------
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay();
    const { jobId } = params;
    let assessment = await db.assessments.where('jobId').equals(jobId as string).first();

    if (!assessment) {
      assessment = {
        id: crypto.randomUUID(),
        jobId,
        title: 'New Assessment',
        status: 'draft',
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      await db.assessments.add(assessment);
    }

    return HttpResponse.json(assessment);
  }),

  http.get('/api/assessments/by-id/:id', async ({ params }) => {
    await delay();
    const { id } = params;
    const assessment = await db.assessments.get(id as string);
    if (!assessment) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(assessment);
  }),
  http.put('/api/assessments/:jobId', async ({ request, params }) => {
  await delay();
  const { jobId } = params;
  const body = await request.json().catch(() => ({}));

  const existing = await db.assessments.where('jobId').equals(jobId as string).first();
  const id = existing?.id ?? crypto.randomUUID();

  const toSave = {
    id,
    jobId,
    title: body.title ?? existing?.title ?? 'Untitled Assessment',
    description: body.description ?? existing?.description ?? '',
    status: body.status ?? existing?.status ?? 'draft',
    sections: Array.isArray(body.sections) ? body.sections : existing?.sections ?? [],
    createdAt: existing?.createdAt ?? new Date(),
    updatedAt: new Date(),
  };

  await db.assessments.put(toSave);
  return HttpResponse.json(toSave, { status: 200 });
}),


  // ✅ FIXED: Always return JSON body
  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    await delay();
    const { jobId } = params;
    const payload = await request.json().catch(() => ({}));

    const entry = {
      id: crypto.randomUUID(),
      assessmentId: payload.assessmentId,
      jobId,
      candidateId: payload.candidateId || 'mock-candidate',
      answers: payload.answers || [],
      submittedAt: new Date(),
    };

    await db.responses.add(entry as any);
    return HttpResponse.json(entry, { status: 201 });
  }),
];

