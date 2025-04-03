import { Test, TestingModule } from "@nestjs/testing";
import { OpenaiService } from "../../../src/utils/openai/openai.service";
import * as process from "node:process";
import { isNumber, isString } from "class-validator";

describe("OpenaiService", () => {
  let openaiService: OpenaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenaiService],
    }).compile();
    openaiService = module.get<OpenaiService>(OpenaiService);
  });

  it("환경변수 확인", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });

  it("OpenaiService 객체 생성 확인", () => {
    expect(openaiService).toBeDefined();
  });

  it(
    "generateDiaryCorrection: 테스트",
    async () => {
      const testOriginal =
        "this is a test diary content. I should write anything even though i'm not good at English. omg... I want to be the greatest programmer in Nest.js. How can i be that? I want to be really rich, cute and pretty savage. Like Jennie.";
      const res = await openaiService.generateDiaryCorrection(testOriginal);
      console.log(res);
      expect(res).toBeDefined();
    },
    60 * 1000, // timeout
  );

  it("테스트", () => {
    const TEST_ORIGINAL =
      "this is a test diary content. I should write anything even though i'm not good at English. omg... I want to be the greatest programmer in Nest.js. How can i be that? I want to be really rich, cute and pretty savage. Like Jennie.";
    const MOCK_AI_RESPONSE_JSON = {
      corrected_diary:
        "This is a test diary entry. I should write something even though I'm not good at English. OMG... I want to be the greatest programmer in Nest.js. How can I become that? I want to be really rich, cute, and pretty savage—like Jennie.",
      overall_feedback:
        "영어 일기 작성이 아직 익숙하지 않으신 것 같지만, 자신의 생각을 솔직하게 표현하신 점이 정말 좋습니다! 문법적으로 수정이 필요한 부분이 있었지만, 전체적으로 전달력은 충분했습니다. 특히 Nest.js에 대한 목표가 뚜렷해서 동기부여가 잘 드러났어요. 앞으로도 자신감을 가지고 계속 쓰시면 점점 더 자연스럽고 유창한 표현을 하실 수 있을 거예요. 계속 연습해보세요!",
      corrections: [
        {
          original: "This is a test diary content.",
          original_highlights: ["diary content"],
          correction_highlights: ["diary entry"],
          correction: "This is a test diary entry.",
          explanation:
            "영어에서 'content'는 내용 전체나 추상적인 내용을 말할 때 사용되며, 일기처럼 하나의 글을 지칭할 때는 'entry'가 더 자연스럽습니다. 'diary entry'는 '일기의 한 편'이라는 뜻으로 일반적으로 사용됩니다.",
        },
        {
          original:
            "I should write anything even though i'm not good at English.",
          original_highlights: ["anything", "i'm"],
          correction_highlights: ["something", "I'm"],
          correction:
            "I should write something even though I'm not good at English.",
          explanation:
            "'anything'은 부정문이나 의문문에서 더 자주 쓰이고, 이 문장처럼 긍정적인 맥락에서는 'something'이 자연스럽습니다. 또 'I'는 항상 대문자로 써야 하며, 'I'm'도 대문자로 수정해야 합니다.",
        },
        {
          original: "How can i be that?",
          original_highlights: ["i", "be that"],
          correction_highlights: ["I", "become that"],
          correction: "How can I become that?",
          explanation:
            "'I'는 항상 대문자로 써야 하며, 'be that'은 자연스럽지 않기 때문에 'become that'으로 수정하면 더 명확하게 '그런 사람이 되다'는 의미를 전달할 수 있습니다.",
        },
        {
          original: "I want to be really rich, cute and pretty savage.",
          original_highlights: ["pretty savage"],
          correction_highlights: ["pretty savage—like Jennie"],
          correction:
            "I want to be really rich, cute, and pretty savage—like Jennie.",
          explanation:
            "원래 문장도 문법적으로 틀리지는 않지만, 마지막 문장과 자연스럽게 연결되도록 '—like Jennie'를 붙여주면 의미가 더 명확해지고 표현도 유창해집니다. 또한 나열된 단어들 사이에 'and' 앞에 쉼표를 넣는 것이 공식적인 글쓰기에서는 권장됩니다.",
        },
      ],
    };

    const result = openaiService.parseDiaryCorrectionResponse(
      TEST_ORIGINAL,
      MOCK_AI_RESPONSE_JSON,
    );

    console.log(result);
    const { correction_offset, correction_highlights } = result.corrections[0];
    expect(result).toBeDefined();
    expect(isNumber(correction_offset?.[0])).toBeTruthy();
    expect(isNumber(correction_highlights?.[0].start)).toBeTruthy();
    expect(isNumber(correction_highlights?.[0].end)).toBeTruthy();
    expect(isString(correction_highlights?.[0].text)).toBeTruthy();
  });
});
