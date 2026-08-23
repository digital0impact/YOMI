export type QuoteType = "wisdom" | "poetry";

export interface Quote {
  id: string;
  text: string;
  type: QuoteType;
}

/**
 * "رسالة اليوم" — a bank of short reflective (فكرية) and poetic (شعرية)
 * lines. Unattributed by design: these are either well-known Arabic
 * proverbs or short lines written for this app, not quotes pulled from a
 * named poet or scholar (to avoid ever mis-quoting one).
 */
export const QUOTES: Quote[] = [
  { id: "w1", text: "من جدّ وجد، ومن زرع حصد.", type: "wisdom" },
  { id: "w2", text: "العلم نور، وأول خطوة نحوه كتاب تفتحينه.", type: "wisdom" },
  { id: "w3", text: "الصبر مفتاح الفرج.", type: "wisdom" },
  { id: "w4", text: "قطرة الماء تحفر الصخر، لا بقوتها بل بتكرارها.", type: "wisdom" },
  { id: "w5", text: "من طلب العلا سهر الليالي.", type: "wisdom" },
  { id: "w6", text: "خير الأعمال أدومها، وإن قلّ.", type: "wisdom" },
  { id: "w7", text: "الشكر يزيد النعمة، والتذمر يُطفئ البركة.", type: "wisdom" },
  { id: "w8", text: "الطريق الطويل يبدأ بخطوة واحدة، فابدئي.", type: "wisdom" },
  { id: "w9", text: "من عرفت قيمة وقتها، أحسنت اختيار أيامها.", type: "wisdom" },
  { id: "w10", text: "الوقت كالسيف، إن لم تقطعيه قطعكِ.", type: "wisdom" },
  { id: "w11", text: "رفقًا بنفسك، فالتقدّم البطيء أفضل من التوقف.", type: "wisdom" },
  { id: "w12", text: "أجمل النجاحات تلك التي سبقتها محاولات كثيرة.", type: "wisdom" },
  { id: "w13", text: "من صدق مع نفسه، أصلح كل شيء حوله.", type: "wisdom" },
  { id: "w14", text: "لا يصغر الخير مهما صغر، فكل معروف صدقة.", type: "wisdom" },
  { id: "w15", text: "العادة الصغيرة اليوم، هي إنجازك الكبير بعد سنة.", type: "wisdom" },
  { id: "p1", text: "خطوةٌ في الصباح، تكفي لتُشرقَ الأيام.", type: "poetry" },
  { id: "p2", text: "من قلبٍ صادقٍ تُزهر الأفعال، ولو كانت صغيرة كالمطر.", type: "poetry" },
  { id: "p3", text: "لا تُصغري أثركِ، فالنجمة الصغيرة تُضيء ليلًا كاملًا.", type: "poetry" },
  { id: "p4", text: "كوني كالبستان، تُعطين ولو لم يُطلب منكِ العطاء.", type: "poetry" },
  { id: "p5", text: "في كل يومٍ جديد، بذرةُ أملٍ تنتظر يدَكِ.", type: "poetry" },
  { id: "p6", text: "الصبرُ زهرةٌ بطيئة النمو، لكنّ عطرها يبقى.", type: "poetry" },
  { id: "p7", text: "لا تخافي البدايات الصغيرة، فمنها تُبنى الجبال.", type: "poetry" },
  { id: "p8", text: "قلبٌ يذكر الله يهدأ، كما يهدأ البحر بعد العاصفة.", type: "poetry" },
  { id: "p9", text: "كوني نورًا في زاويتكِ، فالعالم يُضاء بأنوارٍ صغيرة.", type: "poetry" },
  { id: "p10", text: "الأمل ضوءٌ لا يُطفئه ظلامُ يومٍ واحد.", type: "poetry" },
  { id: "p11", text: "لكِ في كل صباحٍ بدايةٌ جديدة، فلا تحمّلي قلبكِ أمس.", type: "poetry" },
  { id: "p12", text: "دعي أثرَكِ يتكلم عنكِ، فالفعل أصدق من كل قول.", type: "poetry" },
];
