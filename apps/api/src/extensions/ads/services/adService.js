import db from '../../../db/index.js';
import { adSlots, ads } from '../schema.js';
import { eq, and, desc, asc, lte, gte, or, isNull, sql, count } from 'drizzle-orm';

// ============ 广告位服务 ============

/**
 * 获取所有广告位列表
 */
export async function getAdSlots({ includeInactive = false } = {}) {
  const conditions = [];

  if (!includeInactive) {
    conditions.push(eq(adSlots.isActive, true));
  }

  const result = await db
    .select()
    .from(adSlots)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(adSlots.name));

  return result;
}

/**
 * 根据 ID 获取广告位
 */
export async function getAdSlotById(id) {
  const [slot] = await db
    .select()
    .from(adSlots)
    .where(eq(adSlots.id, id))
    .limit(1);

  return slot;
}

/**
 * 根据 code 获取广告位
 */
export async function getAdSlotByCode(code) {
  const [slot] = await db
    .select()
    .from(adSlots)
    .where(eq(adSlots.code, code))
    .limit(1);

  return slot;
}

/**
 * 创建广告位
 */
export async function createAdSlot(data) {
  const [slot] = await db
    .insert(adSlots)
    .values({
      name: data.name,
      code: data.code,
      description: data.description || null,
      width: data.width || null,
      height: data.height || null,
      maxAds: data.maxAds || 1,
      isActive: data.isActive !== false,
    })
    .returning();

  return slot;
}

/**
 * 更新广告位
 */
export async function updateAdSlot(id, data) {
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.width !== undefined) updateData.width = data.width;
  if (data.height !== undefined) updateData.height = data.height;
  if (data.maxAds !== undefined) updateData.maxAds = data.maxAds;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const [slot] = await db
    .update(adSlots)
    .set(updateData)
    .where(eq(adSlots.id, id))
    .returning();

  return slot;
}

/**
 * 删除广告位
 */
export async function deleteAdSlot(id) {
  await db.delete(adSlots).where(eq(adSlots.id, id));
  return { success: true };
}

// ============ 广告服务 ============

/**
 * 获取广告列表
 */
export async function getAds({
  slotId,
  type,
  isActive,
  includeInactive = false,
  page = 1,
  limit = 20
} = {}) {
  const conditions = [];

  if (slotId) {
    conditions.push(eq(ads.slotId, slotId));
  }

  if (type) {
    conditions.push(eq(ads.type, type));
  }

  if (isActive !== undefined) {
    conditions.push(eq(ads.isActive, isActive));
  } else if (!includeInactive) {
    conditions.push(eq(ads.isActive, true));
  }

  const offset = (page - 1) * limit;

  const [result, countResult] = await Promise.all([
    db
      .select({
        ad: ads,
        slot: adSlots,
      })
      .from(ads)
      .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(ads.priority), desc(ads.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(ads)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  const items = result.map(row => ({
    ...row.ad,
    slot: row.slot,
  }));

  return {
    items,
    total: countResult[0].count,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].count / limit),
  };
}

/**
 * 根据 ID 获取广告
 */
export async function getAdById(id) {
  const [result] = await db
    .select({
      ad: ads,
      slot: adSlots,
    })
    .from(ads)
    .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
    .where(eq(ads.id, id))
    .limit(1);

  if (!result) return null;

  return {
    ...result.ad,
    slot: result.slot,
  };
}

/**
 * 创建广告
 */
export async function createAd(data) {
  const [ad] = await db
    .insert(ads)
    .values({
      slotId: data.slotId,
      title: data.title,
      type: data.type,
      content: data.content || null,
      linkUrl: data.linkUrl || null,
      targetBlank: data.targetBlank !== false,
      priority: data.priority || 0,
      startAt: data.startAt || null,
      endAt: data.endAt || null,
      isActive: data.isActive !== false,
      remark: data.remark || null,
    })
    .returning();

  return ad;
}

/**
 * 更新广告
 */
export async function updateAd(id, data) {
  const updateData = {};

  if (data.slotId !== undefined) updateData.slotId = data.slotId;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
  if (data.targetBlank !== undefined) updateData.targetBlank = data.targetBlank;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.startAt !== undefined) updateData.startAt = data.startAt;
  if (data.endAt !== undefined) updateData.endAt = data.endAt;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.remark !== undefined) updateData.remark = data.remark;

  const [ad] = await db
    .update(ads)
    .set(updateData)
    .where(eq(ads.id, id))
    .returning();

  return ad;
}

/**
 * 删除广告
 */
export async function deleteAd(id) {
  await db.delete(ads).where(eq(ads.id, id));
  return { success: true };
}

/**
 * 获取指定广告位的有效广告（用于前端展示）
 */
export async function getActiveAdsBySlotCode(slotCode) {
  const now = new Date();

  // 先获取广告位
  const slot = await getAdSlotByCode(slotCode);
  if (!slot || !slot.isActive) {
    return { slot: null, ads: [] };
  }

  // 获取该广告位下有效的广告
  const result = await db
    .select()
    .from(ads)
    .where(
      and(
        eq(ads.slotId, slot.id),
        eq(ads.isActive, true),
        or(isNull(ads.startAt), lte(ads.startAt, now)),
        or(isNull(ads.endAt), gte(ads.endAt, now))
      )
    )
    .orderBy(desc(ads.priority), desc(ads.createdAt))
    .limit(slot.maxAds);

  return {
    slot,
    ads: result,
  };
}

/**
 * 记录广告展示
 */
export async function recordImpression(adId) {
  await db
    .update(ads)
    .set({
      impressions: sql`${ads.impressions} + 1`,
    })
    .where(eq(ads.id, adId));
}

/**
 * 记录广告点击
 */
export async function recordClick(adId) {
  await db
    .update(ads)
    .set({
      clicks: sql`${ads.clicks} + 1`,
    })
    .where(eq(ads.id, adId));
}
