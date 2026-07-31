'use client';

import { useEffect, useRef, useState, useMemo, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import MiniGames2 from '../Mini_games_2/Mini_games_2';
import MiniGames3 from '../Mini_games_3/Mini_games_3';
import MiniGames4 from '../Mini_games_4/Mini_games_4';
import MiniGames5 from '../Mini_games_5/Mini_games_5';
import AudioSettingsButton from '../components/AudioSettingsButton';

// ── ภาพฉากหลัง (ตามชื่อไฟล์จริงใน public/images/Daily story background images) ──
const IMG_BASE = '/images/Daily story background images/';
const BG = {
  bedroom: encodeURI(IMG_BASE + 'ห้องนอน.jpg'),
  classroomDay1: encodeURI(IMG_BASE + 'ห้องเรียนวันที่ 1.jpg'),
  courtyardDay2: encodeURI(IMG_BASE + 'ลานกว้างวันที่2.jpg'),
  courtyardEveningDay2: encodeURI(IMG_BASE + 'ลานกว้างตอนเย็น.jpg'),
  gardenDay2: encodeURI(IMG_BASE + 'สวนที่มีเครื่องออกกำลังกายกลางแจ้ง.jpg'),
  treeSpotDay3: encodeURI(IMG_BASE + 'จุดสงบใต้ต้นไม้.jpg'),
  cafeteriaDay3: encodeURI(IMG_BASE + 'โรงอาหารวันที่3.jpeg'),
  goodEnding: encodeURI(IMG_BASE + 'ฉากจบแบบดี (Good Ending).jpg'),
  badEnding: encodeURI(IMG_BASE + 'ฉากจบแบบแย่ (Bad Ending).jpg'),
} as const;

const DAY_BACKGROUNDS: Record<number, Partial<Record<StoryNode, string>>> = {
  0: {
    intro: BG.bedroom,
    introMiniGame: BG.bedroom,
    afterIntro: BG.bedroom,
    beforeChoice1: BG.classroomDay1,
    choice1: BG.classroomDay1,
    choice1_optA: BG.classroomDay1,
    choice1_optB: BG.classroomDay1,
    choice1_confirm: BG.classroomDay1,
    choice1_name: BG.classroomDay1,
    choice1_afterName: BG.classroomDay1,
    converge: BG.classroomDay1,
    beforeChoice2: BG.bedroom,
    choice2: BG.bedroom,
    choice2_optA: BG.bedroom,
    choice2_optB: BG.bedroom,
    preEnding: BG.bedroom,
    dayEnd: BG.bedroom,
  },
  1: {
    intro: BG.bedroom,
    atSchool: BG.courtyardDay2,
    choice1: BG.courtyardEveningDay2,
    choice1_optA: BG.courtyardEveningDay2,
    choice1_optB: BG.courtyardEveningDay2,
    converge: BG.courtyardEveningDay2,
    beforeChoice2: BG.gardenDay2,
    choice2: BG.gardenDay2,
    choice2_optA: BG.gardenDay2,
    choice2_optB: BG.gardenDay2,
    preEnding: BG.gardenDay2,
    dayEnd: BG.gardenDay2,
  },
  2: {
    intro: BG.bedroom,
    choice1: BG.treeSpotDay3,
    choice1_optA: BG.cafeteriaDay3,
    choice1_optB: BG.treeSpotDay3,
    converge: BG.treeSpotDay3,
    beforeChoice2: BG.bedroom,
    choice2: BG.bedroom,
    choice2_optA: BG.bedroom,
    choice2_optB: BG.bedroom,
    preEnding: BG.bedroom,
    dayEnd: BG.bedroom,
  },
};

function getBackground(dayIndex: number, node: StoryNode): string {
  return DAY_BACKGROUNDS[dayIndex]?.[node] ?? BG.bedroom;
}

const STORY_NODE_TEXT_KEY: Partial<Record<StoryNode, string>> = {
  intro: 'intro',
  afterIntro: 'after_intro',
  beforeChoice1: 'before_choice1',
  atSchool: 'at_school',
  choice1_optA: 'choice1_optA_story',
  choice1_optB: 'choice1_optB_story',
  converge: 'converge_story',
  choice1_afterName: 'choice1_afterName_story',
  beforeChoice2: 'before_choice2',
  choice2_optA: 'choice2_optA_story',
  choice2_optB: 'choice2_optB_story',
  preEnding: 'pre_ending',
};

function splitStorySegments(text: string): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) return paragraphs;

  const maxLength = 240;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return [trimmed];

  const chunks: string[] = [];
  let remainder = trimmed;

  while (remainder.length > maxLength) {
    const slice = remainder.slice(0, maxLength);
    const boundary = Math.max(
      slice.lastIndexOf('。'),
      slice.lastIndexOf('.'),
      slice.lastIndexOf('!'),
      slice.lastIndexOf('?'),
      slice.lastIndexOf(' '),
    );
    const cut = boundary > 0 ? boundary + 1 : maxLength;
    chunks.push(remainder.slice(0, cut).trim());
    remainder = remainder.slice(cut).trim();
  }

  if (remainder) chunks.push(remainder);
  return chunks;
}

// ── คำบรรยายเปิดเกม (typewriter) ───────────────────────────────────────────
const DIALOGS = [
  'มันคืออีกหนึ่งวัน',
  'เป็นบรรยากาศที่ไม่ค่อยดีนักสำหรับวันใหม่',
  'ไม่มีเสียงนกร้อง',
  'ไม่มีแม้แต่แสงสว่างที่ลอดผ่านมาให้คุณเห็น',
  'ไม่มีแม้แต่แสงสว่างที่ลอดผ่านมาให้คุณเห็น',
  'มีเพียงเสียงรบกวนแปลกๆที่ดังอย่างต่อเนื่อง',
  'ต้นตอของมันอยู่ไม่ไกลมากจากตัวคุณมากนัก',
  'โทรศัพท์ที่วางอยู่บนลิ้นชักข้างหัวเตียง',
  'คุณขยับตัวเพียงเล็กน้อยจนเอื้อมือถึงมันได้สำเร็จ',
  'คุณปิดเสียงนาฬิกาปลุก',
];

const TEXT: Record<string, string> = {
  day0_intro: `ความสงบกลับมาอีกครั้ง
คุณพลิกตัวกลับไปในที่จุดเดิม
ดวงตาทั้งสองข้างของคุณยังคงลังเลที่จะเปิดออก

คุณรู้ดี ตอนนี้ไม่ใช่เวลาที่จะนิ่งเฉยและปล่อยเวลาให้ผ่านไป
ในตอนนั้นคุณได้ตัดสินใจ

คุณลุกขึ้น
คุณสูดหายใจเข้าลึกๆ
พยายามสั่งการร่างกายส่วนบนให้ขยับ

ทว่า
สิ่งที่เกิดขึ้นกลับเป็นตัวของคุณที่แค่พลิกไปด้านข้างเท่านั้น
คุณรู้สึกว่าร่างกายหนักอึ้งราวกับเหล็กหลายสิบตัน

แต่ในขณะเดียวกันก็ยังสามารถขยับแขนขาได้เป็นปกติ
เป็นความรู้สึกที่อธิบายไม่ได้
ลุกขึ้น

คุณพยายามอีกครั้ง
แต่ยิ่งคุณคิดที่จะทำมัน ก็ยิ่งรู้สึกว่ามีบางอย่างกดคุณเอาไว้
คุณยกแขนขึ้นมาก่ายหน้าผากตัวเอง ก่อนจะพยายามยืดเส้นเบาๆ

คุณสูดหายใจอีกครั้งและลองเริ่มจากการลืมตาขึ้นมาก่อน
ดวงตาของคุณที่เปิดออกเพียงครึ่งเดียวได้จ้องตรงไปที่เพดานห้อง
โฟกัส

คุณพยายามบอกตัวเองให้ลืมตาค้างเอาไว้
จ้องตรงต่อไปที่เพดานตรงหน้า

จากนั้นจึงเริ่มลองกวาดสายตามองรอบๆ ห้อง
ด้วยแรงอันน้อยนิดที่มี 

คุณทำได้เพียงแค่พลิกตัวไปมาอยู่สองสามครั้งเท่านั้น
คุณตัดสินใจกลับมาตั้งหลักอีกครั้ง

จ้องมองไปยังเพดานผืนเดิมที่ว่างเปล่า
มีเพียงหลอดไฟเพดานที่ไร้ซึ่งแสงไฟ

คุณจ้องมองไปในความว่างเปล่าอยู่นานสองนาน
เปลือกตาของคุณเบาขึ้นจนสามารถเปิดได้อย่างเต็มที่

ร่างกายของคุณเองก็ดูจะเบาขึ้นมาแล้วเหมือนกัน
ตอนนี้มีเพียงอุปสรรคเดียวเท่านั้น`,
  day0_after_intro: ` ลุกขึ้นคุณออกแรงอีกครั้งและครั้งนี้
  คุณสามารถดันตัวเองออกจากฟูกได้ในที่สุด`,

  day0_before_choice1: `ชั่วโมงแรกคือคาบเรียนภาษาอังกฤษ
คุณได้รับกระดาษที่เต็มไปด้วยโจทย์มากมาย

หลังจากการอธิบายของอาจารย์ผู้สอน คุณก็ไม่ปล่อยให้เวลาเสียไปเปล่าๆ
หยิบอุปกรณ์สำหรับการเรียนออกมาและ..........

คุณลองกดปากกาลงบนกระดาษอยู่สักพัก
สิ่งที่เกิดขึ้นคือ....

ความว่างเปล่า
ไม่มีน้ำหมึกไหลออกมาจากลูกกลิ้นที่ปลายปากกาเลยสักหยด

ไม่ต้องสงสัยเลยว่าตอนนี้เกิดอะไรขึ้น
คุณพยายามความหาปากกาสำรองจากในกระเป๋า

แต่เหมือนกับว่าโชคชตาจะไม่ได้ใจดีกับคุณขนาดนั้น
ความพยายามของคุณนั้นไร้ประโยชน์

แม้ในสถานการณ์แบบนี้ มันยังคงมีทางหนึ่งที่จะช่วยคุณให้รอดได้
ทางเดียวที่คุณคิดออก... `,
  day0_choice1_optA_story: `..........................................

  ............................

  ............................

  ............................

    คุณถอนหายใจเบาๆออกมา `,

  day0_choice1_optB_story: `คุณมองหาใครบางคนเพื่อขอความช่วยเหลือ

คุณรู้จักพวกเขาเพียงแค่ผิวเผินเท่านั้น

ความลังเลของคุณเริ่มก่อตัวขึ้นมาในตอนนั้น

ในใจยังคงคิดจะย้อนกลับและต้องการเวลาตัดสินใจใหม่อีกครั้ง

การกระทำของคุณอาจสร้างปัญหาให้ใครก็ได้

เดิมทีมันก็เกิดจากความสะเพร่าของตัวคุณเอง

การต้องพึ่งคนอื่นในสภาพแบบนี้นั้น

มันเป็นสิ่งที่ไม่ควรที่จะเกิดขึ้นด้วยซ้ำ

คุณกลับมาคิดทบทวนอีกครั้ง

การกระทำนั้นมีผลที่ตามมาเสมอ

หากแต่ว่าคุณต้องเลือก

ระหว่างตัวคุณเอง หรือสิ่งอื่น

คุณคิดใหม่อีกครั้ง

และครั้งนี้ คุณตัดสินใจ.... `,
  day0_converge_story:    ` คุณสะกิดคนที่อยู่ใกล้ที่สุดและเอ่ยปากขอความช่วยเหลือ

แม้จะใช้เวลาสักพัก แต่ท้ายที่สุดแล้ว คุณก็ได้สิ่งที่ต้องการมา

คุณเอ่ยขอบคุณเขาอย่างสุภาพ และเหมือนว่าเขาจะยิ้มอ่อนๆอยู่นิดหน่อยด้วย

เอาล่ะ ตอนนี้ก็ถึงเวลา ` ,
  day0_choice1_afterName_story: ` คุณเขียนชื่อตัวเองเรียบร้อย

การตัดสินใจเล็กๆน้อยๆนี้ได้ทำให้คุณรอดชีวิตไปอีกวัน

ส่วนคุณจะทำโจทย์ทั้งหมดได้มั้ยนั้น

ปล่อยให้ความสามารถของคุณเป็นคนตัดสินเถอะ

...*ผีเสื้อเริ่มขยับปีกอีกครั้ง*... `,
  day0_before_choice2:     ` คุณถอดกระเป๋าสะพายออกจากบ่าและวางที่มุมหนึ่งของห้อง

พ่อแม่ของคุณดูเหมือนจะยังไม่กลับบ้าน

ยังพอมีเวลาเหลืออยู่ก่อนที่พวกเขาจะมา

คุณมองไปรอบๆห้องของตัวเอง

ทั้งข้าวของ เฟอร์นีเจอร์ต่างๆนั้นยังคงอยู่ในจุดที่คุ้นเคย

แม้จะไม่รู้สึกมีปัญหากับมันเท่าไหร่ คุณพอใจกับความเป็นอยู่แบบนี้มานานแล้ว

แต่คุณก็เกิดนึกบางอย่างขึ้นมาได้

คุณโดนแม่บ่นทุกครั้งว่าสภาพห้องของคุณนั้นมันรกเกินไป

แต่คุณก็ไม่เคยเก็บมันมาใส่ใจ เพราะคุณไม่ได้คิดแบบนั้น

แน่นอนว่าคุณนึกภาพห้องของคุณในสภาพที่ดีกว่านี้ออกอยู่แล้ว

แต่มันจะไปสำคัญอะไรในเมื่อคุณไม่ได้มีปัญหากับมัน จริงมั้ย?

...........

ถึงอย่างงั้น...

คุณก็เคยแอบคิด

ลองจัดห้องใหม่ให้ดูดีกว่านี้ดีมั้ยนะ?

แต่คุณจำเป็นจะต้องเสียแรงมาทำอะไรแบบนี้จริงๆเหรอ?

คุณถามตัวเองอยู่แบบนั้นวนไป

ยังไงเสีย สักวันห้องของคุณมันก็อาจจะกลับมาเป็นสภาพเดิม

การยอมเหนื่อยเพื่อเพิ่มความสะดวกสบายชั่วคราวนั้น มันคุ้มหรือเปล่า

ไม่ว่ายังไง....

การตัดสินใจมันก็อยู่ที่คุณอยู่ดี `,
  day0_choice2_optA_story: ` แน่ล่ะ มันจะไม่คุ้มเสียแรง
  
  คุณพอใจกับสิ่งที่เป็นอยู่ตอนนี้
  
  แต่นั่นก็เป็นการตัดโอกาสที่จะได้ลองทำอะไรเพื่อตัวเองไปเช่นกัน `,
  day0_choice2_optB_story: ` ไม่มีเวลาให้เสียอีกต่อไป

  ไม่ว่าการตัดสินใจนี้มันจะคุ้มหรือไม่ 
  
  พูดตามตรง คุณคงไม่ต้องเก็บมาใส่ใจหรอก
  
  คุณโยนอะไรก็ตามในหัวตอนนั้นทิ้งไป และเริ่มลงมือ `,
  day0_pre_ending:         ` เวลาในหนึ่งวันนั้นช่างแสนสั้น

คุณมองออกไปนอกหน้าต่าง

ท้องฟ้ายามราตรีนั้นให้ความรู้สึกเงียบสงบ เหมือนดั่งทุกครั้ง....

คุณไม่แน่ใจว่าครั้งนี้มันเงียบกว่าปกติหรือเปล่า

คุณตอบไม่ได้ และดูเหมือนจะไม่ได้สนใจเรื่องความแตกต่างนั้นอยู่แล้วด้วย

ในขณะเดียวกันนั้นเอง

มีผีเสื้อตัวหนึ่งบินมาเกาะที่หน้าต่าง

ดูเหมือนจะเป็นผีเสื้อกลางคืน

พวกมันมักถูกพบได้ค่อนข้างบ่อย สำหรับคุณมันจึงไม่ใช่เรื่องพิเศษอะไร

แต่บางทีก็มีความคิดที่ว่า ตัวเรากับผีเสื้อกลางคืนนั้นคล้ายกันอยู่นิดหน่อย

รู้สึกมีชีวิตในช่วงเวลาที่เงียบสงบแบบนี้

โบยบินภายใต้แสงจันทร์ บนท้องฟ้ากว้างใหญ่

แต่ปีกของผีเสื้อนั้นช่างบอบบาง

หากต้องแบกรับและสร้างสรรบางสิ่งด้วยปีกคู่นั้นแล้ว

คุณจะทำมันได้จริงๆมั้ยนะ? `,

  day1_intro:  `  อ่า ไม่นานก็วนกลับมาอีกแล้ว

เสียงปวดหูที่คุ้นเคย

แม้คุณจะชินกับมันมาสักพักแล้วก็ตาม แต่มันก็ยังน่ารำคาญแบบเสมอต้นเสมอปลายอยู่ดี

แต่ยังไงก็ตาม ว่ากันตามหน้าที่มันถือว่าทำได้ดีเลยทีเดียว

ส่วนคุณเอง....

คงมีแต่ต้องลองอีกครั้ง...

....... เหมือนกับทุกวัน 

คุณลุกขึ้น 

อ่า.... นึกว่ามันจะง่ายขึ้นแล้วนะ

เอาล่ะ.... คงต้องจริงจังกันหน่อยแล้วล่ะ

คุณหายใจเข้าอย่างแรง

ลุกขึ้น !!!!!!

ต้องให้มันได้อย่างงี้สิ `,
  day1_at_school:  `ดูเหมือนวันนี้จะมีกิจกรรมพิเศษที่หาได้ยาก

เอาตรงๆมันก็ไม่ได้พิเศษอะไรมาก

ก็แค่การโดนใช้แรงงานเพื่อแลกกับคะแนนพิเศษ

แม้แต่รายละเอียดคุณก็จำไม่ได้ด้วยซ้ำ คุณรู้เพียงแค่ ต้องมาทำความสะอาดสถานที่

คุณได้เลือกทำในสิ่งที่เข้าใจได้ง่ายที่สุดอย่างนึง

แค่..... เก็บกวาดใบไม้...

และ.... เศษขยะ หรืออะไรก็แล้วแต่ คุณจำได้ไม่มากนัก

ยังไงเสีย คุณคงอยากทำให้มันจบๆไปได้แล้ว

อย่างที่คาดไว้

คุณและคนอื่นๆทำงานได้น่าประทับใจเลยทีเดียว

เพียงเท่านี้หน้าที่ของคุณก็ได้จบลงแล้ว

ในขณะที่คนอื่นๆทะยอยกันไปพักผ่อน

คุณก็ได้เหลือบไปเห็นว่า

ยังคงมีพื้นที่อีกส่วนหนึ่งที่ยังทำความสะอาดไม่เสร็จ

แน่นอนว่าสิ่งนั้นไม่ได้เกี่ยวอะไรกับความรับผิดชอบของคุณ

หากจะเลือกเมินเฉยมันไปเลยคุณก็ทำได้

แต่แค่แว็ปนึง....

ถ้าลองยื่นมือเข้าไปช่วยสักหน่อยก็คงไม่เสียหายอะไร

จำนวนคนที่ทำความสะอาดดูจะน้อยกว่ากลุ่มที่คุณทำงานด้วยก่อนหน้านี้เป็นเท่าตัว

ด้วยความต่างของจำนวณคน คุณเองก็รู้ดี

แม้จะมีตัวคุณเพิ่มไปอีกสักหนึ่งคนมันคงไม่ต่างกันมากหรอก `,
  day1_choice1_optA_story:  `คุณตัดสินใจหันหลังกลับ 
  
ยังไงหน้าที่ของคุณที่นี่ก็จบลงแล้ว
  
สิ่งที่คุณควรทำตอนนี้คือการพักผ่อน
  
.......ใช่มั้ยล่ะ?...........
  
.................................`,
  day1_choice1_optB_story:  `คุณถอนหายใจยาวเฮือกใหญ่
  
จะด้วยความอินดี้หรือเพราะว่างเกินไปก็แล้วแต่
  
คุณก็ได้ตัดสินใจยื่นมือเข้าช่วยพวกเขา `,
  day1_converge_story:      `หลังจากการทำความสะอาดเสร็จสิ้น 
  
คุณก็ไม่ได้ตั้งคำถามกับการกระทำของตัวเองอีกหลักจากนั้น
  
ความเสียดายหรืออะไรพวกนั้นก็ไม่ได้รู้สึกถึงมัน
  
นับว่าเป็นการตัดสินใจที่ไม่ได้แย่ไปเสียทีเดียว

อย่างไรก็ตาม เมื่อหมดหน้าที่แล้วคุณก็พร้อมที่จะเดินทางกลับไปพักผ่อน

!!!

แต่ในตอนนั้นเอง

คุณก็ได้ยินเสียงเรียกของใครบางคน

มีอาจารย์คนหนึ่งเดินตรงมาหาคุณ พร้อมกับถุงกระดาษในมือ

เขายื่นถุงนั้นให้กับคุณ โดยบอกว่าเป็นของติดไม้ติดมือสำหรับทุกคนที่มาทำงานในวันนี้

ข้างในนั้นมีน้ำผลไม้และขนมอีกนิดหน่อย ซึ่งถือว่าดูดีเลยทีเดียว

และจากที่เห็น ดูเหมือนว่าจะมีเพียงคนกลุ่มนี้เท่านั้นที่จะได้ของติดมือกลับบ้าน

หากคุณไม่เลือกที่จะช่วยพวกเขา คุณคงไม่ได้ของพวกนี้มาเป็นแน่

โชคดีจริงๆเลยนะ`,
  day1_before_choice2:  `เวลาพลบค่ำในวันนั้น

คุณที่กำลังกลับบ้านก็ได้เหลือบไปเห็นกับ

สวนขนาดเล็กๆที่มีเครื่องออกกำลังกายอยู่มากมาย

คุณเห็นพวกมันทุกครั้งที่กลับบ้าน และมันก็แทบจะไม่ค่อยมีใครให้ความสนใจ

ช่วงนี้ดูเหมือนว่าคุณจะเริ่มเงยหน้ามองทางมากกว่าแต่ก่อนนิดหน่อย

และวันนี้คุณก็นึกอะไรบางอย่างขึ้นมาจากการได้มองรอบข้าง

มันก็นานแล้วนะที่คุณไม่ได้รักษาสุขภาพตัวเองเท่าที่ควร

ปกติแล้วคุณแทบจะไม่มีเวลามาคิดเรื่องนี้ด้วยซ้ำถ้าเทียบกับสิ่งที่เจอในแต่ละวัน

เรื่องนี้ดึงดูดความสนใจของคุณได้ในระดับหนึ่ง

บางทีคุณอาจจะลองเริ่มออกกำลังกายบ้าง

เพราะคุณรู้สึกได้ว่าสภาพร่างกายของตัวเองเริ่มจะดูไม่ค่อยจืดเท่าไหร่

แต่ทว่า มันจะสายไปหรือเปล่าที่จะลองทำอะไรที่ปกติไม่เคยคิดจะทำ

เรื่องนั้นคงไม่มีใครรู้เหมือนกัน

ไหนๆก็ไหนๆแล้ว คุณเลยคิดที่จะ `,
  day1_choice2_optA_story:  `ดูเหมือนว่าคุณจะมีเรื่องอื่นที่ต้องใส่ใจมากกว่าในตอนนี้
  
  แต่แบบนั้นจะโอเคจริงๆหรือเปล่านะ `,
  day1_choice2_optB_story:  `เมื่อกลับถึงบ้านเมื่อไหร่ 
  
  คุณคิดว่าอยากจะลองดูสักหน่อยกับไอเดียนี้  `,
  day1_pre_ending:   ` คุณผ่านมาได้อีกวัน

แม้จะมีเหนื่อยไปบ้าง และคุณก็หวังลึกๆว่าวันนี้คุณได้ทำอะไรอย่างเต็มที่แล้วจริงๆ

ตอนนี้ได้เวลาพักผ่อนแล้ว

ฝันดี `,

  day2_intro:   ` เป็นเช้าของอีกวัน

ไม่ว่าด้วยเหตุผลอะไรก็ตาม

ดูเหมือนว่าวันนี้คุณจะตื่นก่อนที่จะได้เสียงนาฬิกาปลุกเสียอีก

คุณเอื้อมมือไปหยิบโทรศีพท์ที่วางเอาไว้ตรงที่ประจำ และเปิดขึ้นมาดูเวลา

ปรากฎว่ามันคือก่อนเวลาที่นาฬิกาปลุกจะดังเพียงแค่ 5 นาทีแบบพอดี

ไม่รู้ทำไมเหมือนกัน แต่คุณเหมือนรู้สึกว่าได้เอาชนะอะไรบางอย่างมาได้

คุณกดปิดการปลุกสำหรับวันนี้ ก่อนที่จะวางโทรศัพท์ของคุณลงที่เดิม

คุณกลิ้งตัวกลับที่เดิม และมองขึ้นไปบนเพดานเหมือนอย่างเคย

ในห้องที่ไม่ค่อยจะมีแสงผ่านเข้ามาห้องนี้นั้น

ทั้งความเงียบ.... ความมืด.... หรือความเหงา...

สิ่งนี้อยู่กับคุณมานานตั้งแต่จำความได้

.........

ลุกขึ้น!!!

หืม?

จู่ๆคุณก็ทำสีหน้าประหลาดใจ

สิ่งที่คุณทำเมื่อกี้มันคืออะไร?

มองไปรอบๆอ่า....

ดูเหมือนคุณจะมาไกลอีกก้าวหนึ่งแล้ว

คุณสามารถลุกขึ้นนั่งได้ตั้งแต่ครั้งแรกที่พยายาม

นับว่าเป็นความสำเร็จได้มั้ยนะ?.......

ไม่รู้สิ

ไว้ค่อยเก็บเอาไปคิดทีหลังแล้วกัน

ดูเหมือนว่าจะถึงเวลาพักทานอาหารกลางวันแล้วสิ

โดยปกติแล้วเด็กมัธยมอย่างเราๆจะไปที่ไหนในเวลานี้กันนะ

ที่จริงคำถามนี้ไม่ได้จำเป็นเลยด้วยซ้ำ

"จะไปที่ไหนมันก็เรื่องของแต่ละคน" ก็คงจะเป็นแบบนั้นแหละนะ

อย่างไรก็ดี คุณเองก็ต้องคิดเหมือนกันว่าจะทำอะไร

ในหัวของคุณนึกออกอยู่สองอย่าง

ถ้าไม่ไปที่โรงอาหารแบบคนปกติ ก็คงสักที่หนึ่งที่คุณสามารถทานอาหารได้อย่างสงบ

ก็.... คงต้องเลือกล่ะนะ `,
  day2_choice1_optA_story:  ` คุณเดินมาถึงโรงอาหารอย่างที่ตั้งใจไว้
  
ช่วงเวลาแบบนี้ การต้องฝ่าฝูงชนก็คงเป็นเรื่องที่เลี่ยงไม่ได้
  
เอาเถอะ มันคงไม่ใช่เรื่องใหญ่มากนักหรอก`,
  day2_choice1_optB_story:  ` คุณใช้เวลาราวๆ 5 นาทีในการเดินไปยังจุดต่างๆที่คุณนึกออก

ไม่ว่าจะสถานที่ๆเคยผ่านตา สถานที่ๆบรรยากาศเงียบสงบ
  
รวมไปถึงพื้นที่ใต้ร่มไม้ ใต้อาคารต่างๆ
  
และในที่สุด คุณก็พบจุดที่เหมาะสำหรับการนั่งเฉยๆ
  
และผ่อนคลายกับของว่างที่คุณซื้อก่อนออกมา

ณ ต้นไม้ใหญ่ต้นหนึ่งในโรงเรียน

ใต้ต้นไม้นั้นมีไม้ต้นนั้นมีทั้งโต๊ะและที่นั่งสำหรับพักผ่อน

ดูเหมือนจะเป็นหนึ่งในจุดพักใจของโรงเรียน เพียงแต่ว่าช่วงเวลานี้ไม่ค่อยมีคนมาที่นี่สักเท่าไหร่

นับว่าเป็นโชคดีของคุณที่กำลังตามหาความสงบและความสบายใจ

บรรยากาศเองก็ถือว่ายอดเยี่ยม ไม่แน่คุณอาจจะแวะมาที่นี่อีกในอนาคต `,
  day2_converge_story:      ` แต่ก็ยังน่าแปลกใจ คุณไม่ค่อยเห็นความอุดมสมบูรณ์บ่อยนักตอนอยู่ที่นี่

หรืออาจจะเพราะคุณไม่เคยออกมาสำรวจกันนะ?

ผีเสื้อตัวหนึ่งบินผ่านหน้าคุณไป

ดูเหมือนว่า การตัดสินใจครั้งนี้จะเป็นกำไรสำหรับคุณแล้วล่ะนะ `,
  day2_before_choice2:      ` คุณนั่งอยู่ที่โต๊ะอ่านหนังสือ

มีเพียงแสงไฟจากเพดานที่ส่องลงมาในค่ำคืนนี้

คุณเหมือนจะเขียนบางอย่างลงในสมุด

เป็นไดอารี่ที่นานๆครั้งคุณจะหยิบมันขึ้นมาบันทึกเรื่องราวต่างๆ

ครั้งนี้เหมือนกับว่าคุณกำลังบอกเล่าเรื่องราวต่างๆที่พบเจอมาตลอดช่วง 3 วันที่ผ่านมา

คุณใส่ใจในรายละเอียดของเหตุการณ์เป็นอย่างดี และเหมือนจะตั้งคำถามกับการกระทำของตัวเองแทบจะตลอด

อย่างไรก็ตาม

คุณก็ได้รู้ว่าตัวเองนั้นได้มีการเปลี่ยนแปลงไป....

หรืออาจจะยังคงเป็นคุณคนเดิมที่ยึดมั่นในตัวเองอยู่

เรื่องนั้นคุณเองก็อยากจะหาคำตอบมันต่อไป

แต่ก่อนจะสิ้นสุดบรรทัดสุดท้าย

คุณได้ลองถามคำถามสำคัญกับตัวเอง

ก่อนจะใช้เวลาเพียงชั่วครู่ในการนึกคำตอบ

คำตอบของสิ่งที่คุณผ่านมาทั้งหมด

กับคำถามที่ว่า...

"คุณชอบตัวเองในตอนนี้หรือเปล่า?" `,
  day2_choice2_optA_story:  ` นั่นสินะ..... ก็คงจะเป็นแบบนั้นแหละ `,
  day2_choice2_optB_story:  ` คุณรู้สึกว่านั่นเป็นคำตอบที่พึงพอใจเลยทีเดียว `,
  day2_pre_ending: ` คุณปิดสมุดไดอารี่ลง

คำถามที่ถามตัวเองเมื่อครู่ยังคงค้างอยู่ในหัว

ไม่ว่าคำตอบจะเป็นแบบไหน มันก็เป็นคำตอบของคุณเองอยู่ดี

คุณลุกไปเปิดหน้าต่างรับลมเย็นๆก่อนนอน

และก็ได้เห็นมันอีกครั้ง

ผีเสื้อกลางคืนตัวเดิม เกาะอยู่ที่ขอบหน้าต่างเหมือนไม่เคยไปไหน

ปีกของมันขยับเบาๆ ราวกับกำลังจะบินออกไปสักที่

สามวันที่ผ่านมา คุณเลือกทางของตัวเองมาตลอด

บางทางก็หนักอึ้ง บางทางก็ทำให้ใจเบาขึ้น

คุณไม่รู้หรอกว่าทั้งหมดนี้จะพาไปที่ไหน

รู้แต่เพียงว่า ปีกที่ขยับอยู่ตรงหน้า กำลังจะบินไปเช่นกัน

คุณปิดไฟ และปล่อยให้ความมืดกลืนหายไปกับคืนสุดท้าย `,

  final_good: `คุณเคยได้ยินหรือเปล่า

เรื่องที่ว่าการขยับปีกของผีเสื้ออาจทำให้เกิดพายุเฮอริเคนได้

ถ้าได้เห็นกับตาคงเจ็บจี๊ดเนอะว่านั่น?

ฮ่าๆ....

แต่ดูเหมือนว่า....

เราจะได้เห็นมันแล้วล่ะ....

แบบนี้แสดงว่า... เราคงต้องตั้งชื่อพายุลูกนี้ว่า "{playerName}" ใช่มั้ยนะ?`,
  final_bad: `ในตอนที่ผีเสื้อสายเป็นครั้งแรก

มันราวกับว่าพวกมันได้เกิดใหม่...

เกิดใหม่เป็นสิ่งที่งดงามเกินจะบรรยาย

ปีกของพวกมันช่างน่าหลงใหล และน่าทึ่ง

ความงดงามนี้สามารถพาพวกมันบินข้ามมหาสมุทรได้

ช่างเป็นความงามที่แข็งแกร่ง...

แต่ในขณะเดียวกัน... ก็แสนบอบบาง

แม้จะเปล่งประกายมากแค่ไหน แต่เมื่อยามฝนตก... ปีกที่แสนบอบบางนั้น...`,
};

function formatStoryText(text: string, values: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
const MINI_GAMES = ['Mini_games_2', 'Mini_games_3', 'Mini_games_4', 'Mini_games_5'] as const;
type MiniGameKey = (typeof MINI_GAMES)[number];

type Choice1Config =
  | { hasConfirm: true }
  | { hasConfirm: false; optBMiniGame: MiniGameKey | 'none' };

type DayConfig = {
  dayLabel: string;
  introMiniGame?: MiniGameKey;
  hasSchoolIntro?: boolean;
  choice1: Choice1Config;
  choice2: { optBMiniGame: MiniGameKey | 'none' };
};

const DAY_CONFIGS: DayConfig[] = [
  {
    dayLabel: 'วันที่ 1',
    introMiniGame: 'Mini_games_4',
    choice1: { hasConfirm: true },
    choice2: { optBMiniGame: 'Mini_games_2' },
  },
  {
    dayLabel: 'วันที่ 2',
    hasSchoolIntro: true,
    choice1: { hasConfirm: false, optBMiniGame: 'Mini_games_3' },
    choice2: { optBMiniGame: 'Mini_games_5' },
  },
  {
    dayLabel: 'วันที่ 3',
    choice1: { hasConfirm: false, optBMiniGame: 'none' },
    choice2: { optBMiniGame: 'none' },
  },
];

// ─────────────────────────────────────────────
//  ชื่อปุ่มทางเลือกทั้งหมด (แก้ตรงนี้ที่เดียว เพื่อเปลี่ยนชื่อปุ่มทุกอันในเกม)
//  - choice1OptA / choice1OptB  = ปุ่มหน้าจอ "ทางเลือกที่ 1 / 2" (จอ choice1)
//  - confirmYes / confirmNo     = ปุ่มหน้าจอ "มั่นใจกับทางเลือกไหม" (เฉพาะวันที่มี hasConfirm)
//  - choice2OptA / choice2OptB  = ปุ่มหน้าจอ "ทางเลือก A / B" (จอ choice2)
//  แก้ค่าใน object ของแต่ละวัน (index 0 = วันที่ 1, 1 = วันที่ 2, 2 = วันที่ 3) ได้อิสระ
// ─────────────────────────────────────────────
type ChoiceLabels = {
  choice1OptA: string;
  choice1OptB: string;
  confirmYes: string;
  confirmNo: string;
  choice2OptA: string;
  choice2OptB: string;
};

const CHOICE_LABELS: Record<number, ChoiceLabels> = {
  0: {
    choice1OptA: 'นั่งเงียบๆ',
    choice1OptB: 'ขอยืมปากกาจากใครสักคน',
    confirmYes: 'มั่นใจ',
    confirmNo: 'ไม่มั่นใจ',
    choice2OptA: 'ปล่อยผ่าน',
    choice2OptB: 'ทำความสะอาด',
  },
  1: {
    choice1OptA: 'ไม่ช่วย',
    choice1OptB: 'ช่วย',
    confirmYes: 'มั่นใจ',
    confirmNo: 'ไม่มั่นใจ',
    choice2OptA: 'ไม่คราวหน้า',
    choice2OptB: 'ออกกำลังกาย',
  },
  2: {
    choice1OptA: 'โรงอาหาร',
    choice1OptB: 'มองหาสถานที่สงบๆ',
    confirmYes: 'มั่นใจ',
    confirmNo: 'ไม่มั่นใจ',
    choice2OptA: 'ไม่ชอบ',
    choice2OptB: 'ชอบ',
  },
};

function getChoiceLabels(dayIndex: number): ChoiceLabels {
  return CHOICE_LABELS[dayIndex] ?? CHOICE_LABELS[0];
}

const NEXT_LABELS: Record<string, string> = {
  dialog:      'ถัดไป ▶',
  dialogStart: 'เริ่มผจญภัย ▶',
  miniGameGate:'เล่นมินิเกม ▶',
  dayEnd:      'ไปวันถัดไป ▶',
  dayEndLast:  'สรุปผล ▶',
  final:       'ถัดไป ▶',
  restart:     'เริ่มเกมใหม่ ↺',
  default:     'ถัดไป ▶',
};

const SKIP_LABEL = 'ข้าม ⏭';

type StoryNode =
  | 'intro'
  | 'introMiniGame'
  | 'afterIntro'
  | 'beforeChoice1'
  | 'atSchool'
  | 'choice1'
  | 'choice1_optA'
  | 'choice1_optB'
  | 'choice1_confirm'
  | 'choice1_name'
  | 'choice1_afterName'
  | 'converge'
  | 'beforeChoice2'
  | 'choice2'
  | 'choice2_optA'
  | 'choice2_optB'
  | 'preEnding'
  | 'dayEnd';

type MiniGameSource = 'intro' | 'choice1' | 'choice2';

// ── ตามไดอะแกรม: หลัง "คำนวนค่า Hope และ Fracture" จะแยกเป็นโหนด "Good Ending" /
//    "Bad Ending" (แสดงภาพฉากจบ) ก่อน แล้วจึงต่อด้วย "คำบรรณยาย" (final_narration)
//    และ "Recap" ตามลำดับ — จึงแยก 'ending_reveal' เป็นสกรีนของตัวเองแทนที่จะรวม
//    กับ final_narration ไปเลยเหมือนเดิม ──
type Screen = 'opening_dialog' | 'story' | 'ending_reveal' | 'final_narration' | 'recap';

function ScoreHUD({ hope, fracture }: { hope: number; fracture: number }) {
  return (
    <div className="fixed top-4 left-4 z-40 flex items-center gap-2 rounded-full border border-blue-400/30 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 shadow-lg shadow-black/40 animate-fadeUp">
      <span className="flex items-center gap-1 text-cyan-300 text-sm font-semibold">
        <span className="text-xs">✨</span>{hope}
      </span>
      <span className="h-3 w-px bg-blue-400/30" />
      <span className="flex items-center gap-1 text-red-300 text-sm font-semibold">
        <span className="text-xs">💔</span>{fracture}
      </span>
    </div>
  );
}

function NextButton({
  onClick,
  label = NEXT_LABELS.default,
  className = '',
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'btn-primary inline-flex items-center justify-center gap-2 rounded-lg ' +
        'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 ' +
        'text-white font-semibold px-6 py-2.5 text-base ' +
        'border border-blue-400/60 shadow-lg shadow-blue-950/50 ' +
        'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ' +
        className
      }
    >
      {label}
    </button>
  );
}

/**
 * SkipButton — ปุ่ม "ข้าม" วางคู่กับปุ่มถัดไป
 * กดแล้วจะข้ามไปยังจุดถัดไป (ทางเลือก/โหนดถัดจากเนื้อเรื่องปัจจุบัน) ทันที
 * โดยไม่ต้องรอพิมพ์ข้อความจนจบ หรือกดถัดไปทีละ segment
 */
function SkipButton({
  onClick,
  label = SKIP_LABEL,
  className = '',
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center justify-center gap-2 rounded-lg ' +
        'bg-slate-800/60 hover:bg-slate-700/70 active:bg-slate-800 ' +
        'text-slate-300 font-medium px-5 py-2.5 text-base ' +
        'border border-slate-500/40 shadow-md shadow-black/30 ' +
        'transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ' +
        className
      }
    >
      {label}
    </button>
  );
}

/**
 * Box — การ์ดกระจกฝ้าสำหรับเนื้อหาทุกประเภท (เนื้อเรื่อง / ทางเลือก / เมนูจบเกม ฯลฯ)
 * ลอยกลางล่างจอ แคบกว่าความกว้างจอเต็ม เพื่อไม่ให้บังภาพประกอบทั้งหมด
 * และดูเป็นกล่องข้อความเกมภาพ (visual novel) มากขึ้นแทนแถบเต็มจอแบบเดิม
 */
function Box({
  label,
  children,
  fadeUp = true,
}: {
  label?: string;
  children: React.ReactNode;
  fadeUp?: boolean;
}) {
  return (
    <div className="relative z-10 w-full px-4 pb-4 md:px-0 md:pb-8">
      <div
        className={
          'relative mx-auto w-full max-w-3xl md:max-w-4xl rounded-2xl ' +
          'border border-blue-400/25 bg-slate-950/75 backdrop-blur-md ' +
          'px-6 py-6 shadow-2xl shadow-black/60 md:px-8 md:py-7 ' +
          (fadeUp ? 'animate-fadeUp' : '')
        }
      >
        {label && (
          <span className="absolute -top-3 left-6 rounded-full bg-blue-600/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-md shadow-blue-950/50">
            {label}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

function StoryBox({
  isTyping,
  displayedText,
  segmentIndex,
  label = 'เนื้อเรื่อง',
  nextLabel = NEXT_LABELS.default,
  fadeUp,
  onAdvance,
  onSkip,
}: {
  isTyping: boolean;
  displayedText: string;
  segmentIndex: number;
  label?: string;
  nextLabel?: string;
  fadeUp?: boolean;
  onAdvance: () => void;
  onSkip?: () => void;
}) {
  return (
    <Box label={label} fadeUp={fadeUp}>
      <p
        key={segmentIndex}
        className={
          'animate-fadeUp whitespace-pre-line text-[16px] leading-[1.9] tracking-wide ' +
          'text-slate-100/95 [text-shadow:_0_1px_4px_rgb(0_0_0_/_55%)] ' +
          'min-h-[3.2em] max-h-[42vh] overflow-y-auto pr-1 md:text-[17px]'
        }
      >
        {displayedText}
        <span className="ml-0.5 inline-block h-[1.1em] w-[2px] align-middle bg-blue-400 animate-blink" />
      </p>
      <div className="mt-5 flex justify-end gap-3">
        {onSkip && <SkipButton onClick={onSkip} />}
        <NextButton onClick={onAdvance} label={nextLabel} />
      </div>
    </Box>
  );
}

function MiniGameGate({
  label,
  onPlay,
  playLabel = NEXT_LABELS.miniGameGate,
}: {
  label: string;
  onPlay: () => void;
  playLabel?: string;
}) {
  return (
    <Box label={label}>
      <p className="text-[16px] leading-relaxed text-slate-100/95 md:text-[17px]">
        ก่อนไปต่อ ลองเล่นมินิเกมกันก่อนสักหน่อย
      </p>
      <div className="mt-5 flex justify-end">
        <NextButton onClick={onPlay} label={playLabel} />
      </div>
    </Box>
  );
}

function ChoiceBox({
  label,
  choices,
}: {
  label: string;
  choices: { label: string; color: 'green' | 'purple' | 'yellow' | 'red'; onClick: () => void }[];
}) {
  return (
    <Box label={label}>
      <div className="flex flex-col gap-3">
        {choices.map((c, i) => (
          <button key={i} onClick={c.onClick} className={`choice-btn choice-${c.color}`}>{c.label}</button>
        ))}
      </div>
    </Box>
  );
}

function Stars() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
  })), []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 20% 30%, #0a0a2e 0%, #000 70%)' }}
    >
      {stars.map(s => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────
export default function MainGamePage() {
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>('opening_dialog');
  const [dayIndex, setDayIndex] = useState(0);
  const [node, setNode] = useState<StoryNode>('intro');

  const [hope, setHope] = useState(0);
  const [fracture, setFracture] = useState(0);

  // ── ใช้ติดตามว่าใน "ทางเลือกที่ 1" ของรอบนี้ ผู้เล่นได้รับ Fracture ไปแล้วหรือยัง
  //    ตามไดอะแกรม: ถ้าทางเลือกที่ 1 ให้ Fracture ไปแล้ว จะไม่ได้รับ Hope ซ้ำจากขั้นตอนตั้งชื่อ ──
  const [choice1FractureThisRound, setChoice1FractureThisRound] = useState(false);

  // ── บันทึกการกระทำของผู้เล่น สำหรับใช้สรุปในหน้า Recap ──
  const [actionLog, setActionLog] = useState<string[]>([]);
  function logAction(entry: string) {
    setActionLog(prev => [...prev, entry]);
  }

  // ── ภาพพื้นหลังตามช่วงเกม
  //    - ตอนเล่นเนื้อเรื่อง (screen === 'story') ใช้พื้นหลังตามวัน/โหนดปัจจุบัน
  //    - ตอนคำบรรยายจบเกม + หน้าสรุปผล (screen === 'final_narration' หรือ 'recap')
  //      ใช้ภาพฉากจบ ดี/แย่ ตามผลเทียบ Hope กับ Fracture
  //      ── ตามไดอะแกรม โหนด "คำนวนค่า Hope และ Fracture" จะแยกเป็น 2 เส้นทาง:
  //         "เมื่อมีค่า Hope มากกว่า"    -> Good Ending -> ใช้ภาพ "ฉากจบแบบดี (Good Ending).jpg"
  //         "เมื่อมีค่า Fracture มากกว่า" -> Bad Ending  -> ใช้ภาพ "ฉากจบแบบแย่ (Bad Ending).jpg"
  //      จากนั้นทั้งสองเส้นทางจะไปที่ "คำบรรณยาย" (final_narration) แล้วต่อด้วย "Recap"
  //      ภาพฉากจบจึงต้องค้างอยู่เป็นพื้นหลังตลอดทั้งสองหน้าจอนี้ ──
  const isEndingScreen = screen === 'ending_reveal' || screen === 'final_narration' || screen === 'recap';
  const isGoodEnding = hope > fracture;
  const showBackgroundImage = screen === 'story' || isEndingScreen;
  const currentBg = screen === 'story'
    ? getBackground(dayIndex, node)
    : isGoodEnding
      ? BG.goodEnding
      : BG.badEnding;

  // ── คำบรรยายเปิดเกม ──
  const [step, setStep] = useState(0);
  const [dialogDisplayedText, setDialogDisplayedText] = useState('');
  const [dialogIsTyping, setDialogIsTyping] = useState(false);
  const dialogTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── เนื้อเรื่องระหว่างเล่น ──
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [storySegments, setStorySegments] = useState<string[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── ชื่อผู้เล่น ──
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ── มินิเกม ──
  const [selectedMiniGame, setSelectedMiniGame] = useState<MiniGameKey | null>(null);
  const [miniGameSource, setMiniGameSource] = useState<MiniGameSource | null>(null);

  const miniGameComponents = useMemo<Record<MiniGameKey, ComponentType>>(() => ({
    Mini_games_2: MiniGames2,
    Mini_games_3: MiniGames3,
    Mini_games_4: MiniGames4,
    Mini_games_5: MiniGames5,
  }), []);

  const dayConfig = DAY_CONFIGS[dayIndex];
  const choiceLabels = getChoiceLabels(dayIndex);
  const showScoreHUD = screen === 'story' && node !== 'intro';
  const currentSegmentText = storySegments[segmentIndex] ?? '';

  // ── Dialog typewriter (หน้าเปิดเกม) ──
  useEffect(() => {
    if (screen !== 'opening_dialog') return;
    startDialogTyping(DIALOGS[step]);
    return () => { if (dialogTimerRef.current) clearInterval(dialogTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, screen]);

  // ── Focus ช่องตั้งชื่อ ──
  useEffect(() => {
    if (screen === 'story' && node === 'choice1_name') {
      inputRef.current?.focus();
    }
  }, [screen, node]);

  // ── เมื่อเปลี่ยนโหนด/วัน/ฉากจบ -> โหลด segments ของข้อความใหม่ ──
  useEffect(() => {
    if (screen === 'opening_dialog') return;

    let text: string | null = null;
    if (screen === 'story') {
      const suffix = STORY_NODE_TEXT_KEY[node];
      if (suffix) {
        text = TEXT[`day${dayIndex}_${suffix}`];
      }
    } else if (screen === 'final_narration') {
      if (isGoodEnding) {
        text = formatStoryText(TEXT.final_good, {
          playerName: playerName || 'พายุลูกนี้',
        });
      } else {
        text = TEXT.final_bad;
      }
    }

    const segments = text ? splitStorySegments(text) : [];
    setStorySegments(segments);
    setSegmentIndex(0);
  }, [screen, node, dayIndex, hope, fracture, playerName]);

  // ── เมื่อ segment เปลี่ยน -> เริ่มพิมพ์ข้อความ segment นั้น ──
  useEffect(() => {
    if (screen === 'opening_dialog') return;
    if (!currentSegmentText) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }
    startTyping(currentSegmentText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, currentSegmentText]);

  function startDialogTyping(text: string) {
    if (dialogTimerRef.current) clearInterval(dialogTimerRef.current);
    setDialogDisplayedText('');
    setDialogIsTyping(true);
    let i = 0;
    dialogTimerRef.current = setInterval(() => {
      i++;
      setDialogDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(dialogTimerRef.current!);
        dialogTimerRef.current = null;
        setDialogIsTyping(false);
      }
    }, 40);
  }

  function startTyping(text: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsTyping(false);
      }
    }, 40);
  }

  function handleDialogNext() {
    if (dialogIsTyping) {
      // คลิกครั้งแรกระหว่างพิมพ์ -> แสดงข้อความให้ครบทันที เท่านั้น (ไม่ไปต่อ)
      if (dialogTimerRef.current) {
        clearInterval(dialogTimerRef.current);
        dialogTimerRef.current = null;
      }
      setDialogDisplayedText(DIALOGS[step]);
      setDialogIsTyping(false);
      return;
    }
    // คลิกครั้งถัดไป (พิมพ์ครบแล้ว) -> ไปประโยคถัดไป
    const next = step + 1;
    if (next < DIALOGS.length) {
      setStep(next);
    } else {
      goToDayStart(0);
    }
  }

  // ── ปุ่ม "ข้าม" บนหน้าคำบรรยายเปิดเกม (opening_dialog)
  //    ตามไดอะแกรม (โน้ต "ตรงนี้ถึงตรงนี้มีปุ่ม Skip") ปุ่มข้ามในส่วนคำบรรยายเปิดเกม
  //    จะหยุดพิมพ์ทันทีและข้ามบทพูดที่เหลือทั้งหมด เข้าสู่วันที่ 1 ทันที ──
  function handleDialogSkip() {
    if (dialogTimerRef.current) {
      clearInterval(dialogTimerRef.current);
      dialogTimerRef.current = null;
    }
    setDialogIsTyping(false);
    goToDayStart(0);
  }

  function handleStoryAdvance(nextNode: () => void) {
    if (isTyping) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setDisplayedText(currentSegmentText);
      setIsTyping(false);
      return;
    }

    if (segmentIndex < storySegments.length - 1) {
      setSegmentIndex((index) => index + 1);
      return;
    }

    nextNode();
  }

  // ── ปุ่ม "ข้าม": หยุดพิมพ์ทันที และข้ามไปยังจุดถัดไป (ทางเลือก/โหนดถัดไป)
  //    โดยไม่สนใจว่าจะพิมพ์ค้างอยู่ หรือยังเหลือ segment อื่นให้อ่านอีกกี่อัน ──
  function handleStorySkip(nextNode: () => void) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTyping(false);
    nextNode();
  }

  function goToDayStart(idx: number) {
    setDayIndex(idx);
    setScreen('story');
    setNode('intro');
    setChoice1FractureThisRound(false);
  }

  function handleIntroNext() {
    if (dayConfig.introMiniGame) {
      setNode('introMiniGame');
    } else if (dayConfig.hasSchoolIntro) {
      setNode('atSchool');
    } else {
      setNode('choice1');
    }
  }

  function launchMiniGame(key: MiniGameKey, source: MiniGameSource) {
    setSelectedMiniGame(key);
    setMiniGameSource(source);
  }

  function handleReturnFromMiniGame() {
    const source = miniGameSource;
    setSelectedMiniGame(null);
    setMiniGameSource(null);

    if (source === 'intro') {
      setNode('afterIntro');
    } else if (source === 'choice1') {
      setHope(h => h + 1);
      logAction(`${dayConfig.dayLabel} · ทางเลือกที่ 2 (ผ่านมินิเกม) → ✨ Hope +1`);
      setNode('converge');
    } else if (source === 'choice2') {
      setHope(h => h + 1);
      logAction(`${dayConfig.dayLabel} · ทางเลือก B (ผ่านมินิเกม) → ✨ Hope +1`);
      setNode('preEnding');
    }
  }

  // ── ทางเลือกที่ 1 ──
  function handleChoice1OptA() {
    setNode('choice1_optA');
  }

  function handleChoice1OptAContinue() {
    setFracture(f => f + 1);
    setChoice1FractureThisRound(true);
    logAction(`${dayConfig.dayLabel} · ทางเลือกที่ 1 → 💔 Fracture +1`);
    setNode('converge');
  }

  function handleChoice1OptB() {
    // ตามไดอะแกรม: ทางเลือกที่ 2 ต้องโชว์เนื้อเรื่องของมันก่อนเสมอ
    // (ถ้าวันนั้นมีจอ "มั่นใจกับทางเลือกไหม" จะถามต่อหลังอ่านเนื้อเรื่องจบ)
    setNode('choice1_optB');
  }

  function handleChoice1OptBAdvance() {
    if (dayConfig.choice1.hasConfirm) {
      setNode('choice1_confirm');
    } else {
      handleChoice1OptBFinish();
    }
  }

  // ── มั่นใจ/ไม่มั่นใจ (เฉพาะวันที่มี hasConfirm) ──
  // ตามไดอะแกรม: "ไม่มั่นใจ" ย้อนไปอ่านเนื้อเรื่องทางเลือกที่ 1 ซ้ำ (แล้วได้ Fracture)
  // ส่วน "มั่นใจ" ไปต่อที่เนื้อเรื่องบรรจบกันทันที (ยังไม่ได้ Hope ณ จุดนี้)
  function handleConfirmYes() {
    setNode('converge');
  }

  function handleConfirmNo() {
    setNode('choice1_optA');
  }

  // ตามไดอะแกรม: หลัง "เนื้อเรื่องทางเลือกเหมือนกัน" (converge) ทั้งสองเส้นทาง (Fracture/Hope)
  // จะไปเจอหน้าจอ "ตั้งชื่อผู้เล่น" ต่อกัน (เฉพาะวันที่มี hasConfirm เท่านั้น)
  function handleConvergeAdvance() {
    if (dayConfig.choice1.hasConfirm) {
      setNode('choice1_name');
    } else {
      setNode('beforeChoice2');
    }
  }

  function handleConfirmName() {
    const name = inputName.trim();
    if (!name) { inputRef.current?.focus(); return; }
    setPlayerName(name);
    setNode('choice1_afterName');
  }

  // ตามไดอะแกรม: "ถ้าได้รับ Fracture แล้วจะไม่ได้ Hope หนึ่งหน่วยของอันนี้"
  // -> ให้ Hope เฉพาะกรณีที่ทางเลือกที่ 1 รอบนี้ยังไม่เคยได้ Fracture มาก่อน
  function handleChoice1AfterNameContinue() {
    if (!choice1FractureThisRound) {
      setHope(h => h + 1);
      logAction(`${dayConfig.dayLabel} · ตั้งชื่อ "${playerName}" → ✨ Hope +1`);
    } else {
      logAction(`${dayConfig.dayLabel} · ตั้งชื่อ "${playerName}" (ได้รับ Fracture ไปแล้ว จึงไม่ได้ Hope เพิ่ม)`);
    }
    setNode('beforeChoice2');
  }

  // ── ทางเลือกที่ 2 ──
  function handleChoice2OptA() {
    setNode('choice2_optA');
  }

  function handleChoice2OptAContinue() {
    setFracture(f => f + 1);
    logAction(`${dayConfig.dayLabel} · ทางเลือก A → 💔 Fracture +1`);
    setNode('preEnding');
  }

  function handleChoice2OptB() {
    setNode('choice2_optB');
  }

  function handleChoice1OptBFinish() {
    const cfg = dayConfig.choice1;
    if (cfg.hasConfirm) return;
    if (cfg.optBMiniGame === 'none') {
      setHope(h => h + 1);
      logAction(`${dayConfig.dayLabel} · ทางเลือกที่ 2 → ✨ Hope +1`);
      setNode('converge');
    } else {
      launchMiniGame(cfg.optBMiniGame, 'choice1');
    }
  }

  function handleChoice2OptBFinish() {
    if (dayConfig.choice2.optBMiniGame === 'none') {
      setHope(h => h + 1);
      logAction(`${dayConfig.dayLabel} · ทางเลือก B → ✨ Hope +1`);
      setNode('preEnding');
    } else {
      launchMiniGame(dayConfig.choice2.optBMiniGame, 'choice2');
    }
  }

  // ── จบวัน / จบเกม ──
  // ตามไดอะแกรม: วันสุดท้าย (วันที่ 3) ไม่มีหน้าจอ "จบเกมวันที่ X" แยกต่างหาก
  // "เนื้อเรื่องก่อนจบเกม" (preEnding) ของวันสุดท้ายจะไปคำนวณ Hope/Fracture
  // แล้วเข้าเนื้อเรื่องจบเกมทันที ส่วนวันที่ 1 และ 2 ยังคงผ่านหน้าจอ "จบเกมวันที่ X" ตามเดิม
  function handlePreEndingAdvance() {
    if (dayIndex < DAY_CONFIGS.length - 1) {
      setNode('dayEnd');
    } else {
      // ตามไดอะแกรม: หลัง "เนื้อเรื่องก่อนจบเกม" ของวันสุดท้าย จะไปที่โหนด
      // "คำนวนค่า Hope และ Fracture" แล้วแยกเข้า Good Ending / Bad Ending ก่อน
      // (แสดงภาพฉากจบเดี่ยวๆ) จากนั้นผู้เล่นกดต่อไปจึงเข้าสู่คำบรรณยาย
      setScreen('ending_reveal');
    }
  }

  function handleEndingRevealNext() {
    setScreen('final_narration');
  }

  function handleDayEndNext() {
    goToDayStart(dayIndex + 1);
  }

  function handleRestart() {
    setScreen('opening_dialog');
    setStep(0);
    setDayIndex(0);
    setNode('intro');
    setHope(0);
    setFracture(0);
    setChoice1FractureThisRound(false);
    setPlayerName('');
    setInputName('');
    setActionLog([]);
    router.push('/');
  }

  // ── Mini-game overlay ──
  if (selectedMiniGame) {
    const SelectedGame = miniGameComponents[selectedMiniGame];
    return (
      <div className="relative min-h-screen bg-black">
        <div className="absolute z-50 top-4 left-4">
          <button
            type="button"
            onClick={handleReturnFromMiniGame}
            className="rounded-lg border border-slate-200/30 bg-slate-950/80 px-4 py-2 text-sm text-white transition hover:bg-slate-900"
          >
            จบเกมและกลับ
          </button>
        </div>
        <div className="fixed top-4 right-4 z-50">
          <AudioSettingsButton />
        </div>
        <SelectedGame />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCREENS
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col justify-end bg-black overflow-hidden">
      {showBackgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-700 ease-out"
          style={{ backgroundImage: `url("${currentBg}")` }}
        >
          {/* โทนมืดบางๆ ทั้งภาพ เพื่อให้อารมณ์ฉากนุ่มลง แต่ยังเห็นภาพประกอบชัด */}
          <div className="absolute inset-0 bg-black/20" />
          {/* ไล่เฉดมืดเข้มขึ้นเฉพาะโซนล่างจอ (จุดที่มีกล่องข้อความ) เพื่อให้อ่านง่าย
              โดยไม่ต้องบังภาพประกอบทั้งจอเหมือนเดิม
              ── หน้า Recap ใช้เฉดที่เข้มขึ้นอีกนิด เพราะมีข้อความ/รายการค่อนข้างเยอะ ── */}
          <div
            className={
              'absolute inset-0 bg-gradient-to-t ' +
              (screen === 'recap'
                ? 'from-black/90 via-black/50 to-black/10'
                : 'from-black/85 via-black/25 to-transparent')
            }
          />
        </div>
      )}
      {!showBackgroundImage && <Stars />}

      <div className="fixed top-4 right-4 z-50">
        <AudioSettingsButton />
      </div>

      {showScoreHUD && <ScoreHUD hope={hope} fracture={fracture} />}

      {/* ── คำบรรยายเปิดเกม ──
          ตามไดอะแกรม: มีปุ่ม Skip ครอบคลุมตั้งแต่ "คำบรรยาย" (หน้านี้) ไปจนถึง
          "เนื้อเรื่องก่อนทางเลือก" (beforeChoice1) — กดแล้วข้ามบทพูดเปิดเกมที่เหลือ
          ทั้งหมดและเข้าสู่วันที่ 1 ทันที (ผู้เล่นจะไปกดข้ามที่ฉาก intro/มินิเกม/afterIntro
          ต่อเองได้ เพราะแต่ละหน้านั้นมีปุ่มข้ามของตัวเองอยู่แล้ว) ── */}
      {screen === 'opening_dialog' && (
        <Box label="ข้อความ" fadeUp={false}>
          <p className="whitespace-pre-line text-[16px] leading-[1.9] tracking-wide text-slate-100/95 min-h-[3.2em] md:text-[17px]">
            {dialogDisplayedText}
            <span className="ml-0.5 inline-block h-[1.1em] w-[2px] align-middle bg-blue-400 animate-blink" />
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <SkipButton onClick={handleDialogSkip} />
            <NextButton
              onClick={handleDialogNext}
              label={step === DIALOGS.length - 1 && !dialogIsTyping ? NEXT_LABELS.dialogStart : NEXT_LABELS.dialog}
            />
          </div>
        </Box>
      )}

      {screen === 'story' && (
        <>
          {node === 'intro' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              label={dayConfig.dayLabel}
              fadeUp={true}
              onAdvance={() => handleStoryAdvance(handleIntroNext)}
              onSkip={() => handleStorySkip(handleIntroNext)}
            />
          )}

          {node === 'introMiniGame' && dayConfig.introMiniGame && (
            <MiniGameGate
              label={dayConfig.dayLabel}
              onPlay={() => launchMiniGame(dayConfig.introMiniGame!, 'intro')}
            />
          )}

          {node === 'afterIntro' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(() => setNode('beforeChoice1'))}
              onSkip={() => handleStorySkip(() => setNode('beforeChoice1'))}
            />
          )}

          {/* ── ใหม่: จุดพักเนื้อเรื่องก่อนขึ้นจอทางเลือก 1 (ตามไดอะแกรม ภาพ2) ── */}
          {node === 'beforeChoice1' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(() => setNode('choice1'))}
              onSkip={() => handleStorySkip(() => setNode('choice1'))}
            />
          )}

          {node === 'atSchool' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(() => setNode('choice1'))}
              onSkip={() => handleStorySkip(() => setNode('choice1'))}
            />
          )}

          {node === 'choice1' && (
            <ChoiceBox
              label={`ทางเลือก – ${dayConfig.dayLabel}`}
              choices={[
                { label: choiceLabels.choice1OptA, color: 'green',  onClick: handleChoice1OptA },
                { label: choiceLabels.choice1OptB, color: 'purple', onClick: handleChoice1OptB },
              ]}
            />
          )}

          {node === 'choice1_optA' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(handleChoice1OptAContinue)}
              onSkip={() => handleStorySkip(handleChoice1OptAContinue)}
            />
          )}

          {/* ── แก้: ทางเลือกที่ 2 ต้องโชว์เนื้อเรื่องก่อนเสมอ ไม่ว่าจะมีจอยืนยันหรือไม่
              (ของเดิมข้ามไปจอยืนยันทันทีสำหรับวันที่มี hasConfirm) ── */}
          {node === 'choice1_optB' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(handleChoice1OptBAdvance)}
              onSkip={() => handleStorySkip(handleChoice1OptBAdvance)}
            />
          )}

          {node === 'choice1_confirm' && (
            <ChoiceBox
              label="มั่นใจกับทางเลือกไหม"
              choices={[
                { label: choiceLabels.confirmYes, color: 'green', onClick: handleConfirmYes },
                { label: choiceLabels.confirmNo,  color: 'red',   onClick: handleConfirmNo },
              ]}
            />
          )}

          {node === 'converge' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(handleConvergeAdvance)}
              onSkip={() => handleStorySkip(handleConvergeAdvance)}
            />
          )}

          {/* ── ตามไดอะแกรม: หน้าตั้งชื่อผู้เล่นอยู่ "หลัง" เนื้อเรื่องบรรจบกัน (converge)
              และเกิดขึ้นได้ทั้งสองเส้นทาง (Fracture หรือ Hope) ของทางเลือกที่ 1 ── */}
          {node === 'choice1_name' && (
            <Box label="ตั้งชื่อตัวละคร">
              <p className="mb-4 text-sm text-blue-300">ใส่ชื่อตัวเอกของเรื่องราวด้านล่าง</p>
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={20}
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmName()}
                  placeholder="ชื่อตัวละคร..."
                  autoFocus
                  className="flex-1 rounded-lg border border-blue-600 bg-white/5 px-4 py-2.5 text-base text-slate-100 outline-none placeholder-blue-900 transition-colors focus:border-blue-400"
                />
                <NextButton onClick={handleConfirmName} label="ยืนยัน ✓" />
              </div>
            </Box>
          )}

          {node === 'choice1_afterName' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(handleChoice1AfterNameContinue)}
              onSkip={() => handleStorySkip(handleChoice1AfterNameContinue)}
            />
          )}

          {/* ── ใหม่: จุดพักเนื้อเรื่องก่อนขึ้นจอทางเลือกรอบสอง (ตามไดอะแกรม node "เนื้อเรื่อง"
              ที่อยู่ก่อน "ทางเลือก" รอบสองของทุกวัน — เดิมโค้ดข้ามตรงไปที่ choice2 ทันที) ── */}
          {node === 'beforeChoice2' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(() => setNode('choice2'))}
              onSkip={() => handleStorySkip(() => setNode('choice2'))}
            />
          )}

          {node === 'choice2' && (
            <ChoiceBox
              label={`ทางเลือก – ${dayConfig.dayLabel}`}
              choices={[
                { label: choiceLabels.choice2OptA, color: 'green',  onClick: handleChoice2OptA },
                { label: choiceLabels.choice2OptB, color: 'purple', onClick: handleChoice2OptB },
              ]}
            />
          )}

          {node === 'choice2_optA' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(handleChoice2OptAContinue)}
              onSkip={() => handleStorySkip(handleChoice2OptAContinue)}
            />
          )}

          {node === 'choice2_optB' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              onAdvance={() => handleStoryAdvance(handleChoice2OptBFinish)}
              onSkip={() => handleStorySkip(handleChoice2OptBFinish)}
            />
          )}

          {node === 'preEnding' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              segmentIndex={segmentIndex}
              label="ก่อนจบวัน"
              onAdvance={() => handleStoryAdvance(handlePreEndingAdvance)}
              onSkip={() => handleStorySkip(handlePreEndingAdvance)}
            />
          )}

          {node === 'dayEnd' && (
            <Box label={dayConfig.dayLabel}>
              <p className="text-[17px] leading-relaxed text-slate-100/95">
                จบ{dayConfig.dayLabel}แล้ว
              </p>
              <div className="mt-5 flex justify-end">
                <NextButton
                  onClick={handleDayEndNext}
                  label={NEXT_LABELS.dayEnd}
                />
              </div>
            </Box>
          )}
        </>
      )}

      {/* ── Good Ending / Bad Ending ──
          ตามไดอะแกรม: โหนดนี้แยกออกมาต่างหากจาก "คำบรรณยาย" — แสดงภาพฉากจบ
          ("ฉากจบแบบดี (Good Ending).jpg" หรือ "ฉากจบแบบแย่ (Bad Ending).jpg")
          พร้อมชื่อฉากจบให้ผู้เล่นได้เห็นก่อน แล้วค่อยกดต่อไปเข้าคำบรรณยาย ── */}
      {screen === 'ending_reveal' && (
        <Box label={isGoodEnding ? 'Good Ending' : 'Bad Ending'}>
          <p className="text-[17px] leading-relaxed text-slate-100/95">
            {isGoodEnding
              ? 'เส้นทางที่คุณเลือกมาตลอดทั้ง 3 วัน นำไปสู่ฉากจบแบบดี'
              : 'เส้นทางที่คุณเลือกมาตลอดทั้ง 3 วัน นำไปสู่ฉากจบแบบแย่'}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-cyan-300">✨ Hope: {hope}</span>
            <span className="text-red-300">💔 Fracture: {fracture}</span>
          </div>
          <div className="mt-5 flex justify-end">
            <NextButton onClick={handleEndingRevealNext} label={NEXT_LABELS.final} />
          </div>
        </Box>
      )}

      {/* ── คำบรรยายจบเกม ──
          ตามไดอะแกรม: หลัง Good/Bad Ending แล้วเข้า "คำบรรณยาย"
          จอนี้จึงใช้ภาพพื้นหลังฉากจบ (currentBg) ที่คำนวณจาก isGoodEnding ด้านบนแล้ว
          (พื้นหลังต่อเนื่องมาจากหน้า ending_reveal) ── */}
      {screen === 'final_narration' && (
        <StoryBox
          isTyping={isTyping}
          displayedText={displayedText}
          segmentIndex={segmentIndex}
          label={isGoodEnding ? 'Good Ending' : 'Bad Ending'}
          nextLabel={NEXT_LABELS.final}
          onAdvance={() => handleStoryAdvance(() => setScreen('recap'))}
          onSkip={() => handleStorySkip(() => setScreen('recap'))}
        />
      )}

      {/* ── สรุปผล ──
          ตามไดอะแกรม: "Recap การกระทำของผู้เล่นตลอดทั้งเกมว่าทำอะไรไปบ้าง"
          ต่อจาก "คำบรรณยาย" ของฉากจบโดยตรง จึงโชว์คะแนนรวม + รายการทางเลือกที่ผู้เล่น
          กดไปตลอดทั้ง 3 วัน พร้อมภาพฉากจบดี/แย่เดิมเป็นพื้นหลัง (ต่อเนื่องจากหน้าก่อน) ── */}
      {screen === 'recap' && (
        <Box label={isGoodEnding ? 'สรุปผล · Good Ending' : 'สรุปผล · Bad Ending'}>
          <p className="text-lg text-yellow-300">
            {playerName ? `${playerName} ` : ''}ผ่านการผจญภัยมาได้แล้ว
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-cyan-300">✨ Hope: {hope}</span>
            <span className="text-red-300">💔 Fracture: {fracture}</span>
          </div>

          {actionLog.length > 0 && (
            <div className="mt-4 max-h-[30vh] overflow-y-auto rounded-lg border border-blue-400/20 bg-black/20 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300">
                เส้นทางที่คุณเลือก
              </p>
              <ul className="space-y-1.5 text-sm text-slate-100/90">
                {actionLog.map((entry, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-3 text-sm text-blue-300">ขอบคุณที่เล่นเกมนี้ 🌟</p>
          <div className="mt-4 text-right">
            <button onClick={handleRestart} className="btn-secondary">
              {NEXT_LABELS.restart}
            </button>
          </div>
        </Box>
      )}
    </div>
  );
}