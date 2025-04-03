describe("Data Parser", () => {
  const MOCK_ORIGINAL =
    "I just wanted to refresh my mood, so I decided to grab a coffee. I'd been wanting to go to that cafe since I found it. They have Siphon Coffee, and I really wanted to try them.\n" +
    "\n" +
    "It was really nice. It was quiet and the music was so calm. I think this place is good to focus on something. Oh! They have point system and they give a lot of points.\n" +
    "\n" +
    "Can you see that Siphon Coffee maker? It was for my coffee. The coffee bean that I had was really good, and I wanted to buy it. And I wanted to come with my mom someday. She loves coffee.";

  const MOCK_RESPONSE = {
    corrected_diary:
      "I just wanted to refresh my mood, so I decided to grab a coffee. I'd been wanting to go to that cafe since I discovered it. They have Siphon Coffee, and I really wanted to try it.\n\nIt was really nice. It was quiet, and the music was so calming. I think this place is great for focusing on something. Oh! They have a point system, and they give a lot of points.\n\nCan you see that Siphon Coffee maker? It was used to make my coffee. The coffee beans I had were really good, and I wanted to buy some. I also want to come back with my mom someday. She loves coffee.",
    overall_feedback:
      "전반적으로 일기가 자연스럽고 의미 전달이 잘 되었어요! 하지만 몇 가지 문법적인 오류와 더 자연스러운 표현을 위해 수정이 필요했습니다. 특히 'discover'와 'find'의 차이, 'it'과 'them'의 올바른 사용, 그리고 자연스러운 표현을 위한 어휘 개선이 있었습니다. 앞으로는 단수/복수 표현과 전치사 사용에 조금 더 신경 쓰면 더욱 자연스럽게 쓸 수 있을 거예요!",
    corrections: [
      {
        original: "I'd been wanting to go to that cafe since I found it.",
        original_highlights: ["found"],
        correction_highlights: ["discovered"],
        correction:
          "I'd been wanting to go to that cafe since I discovered it.",
        explanation:
          "'find'는 '무언가를 우연히 발견하다'는 뜻이고, 'discover'는 '새로운 장소나 정보를 발견하다'는 의미로 더 적절합니다. 새로운 카페를 알고 방문하고 싶었다는 문맥에서는 'discover'가 더 자연스럽습니다.",
      },
      {
        original: "They have Siphon Coffee, and I really wanted to try them.",
        original_highlights: ["them"],
        correction_highlights: ["it"],
        correction: "They have Siphon Coffee, and I really wanted to try it.",
        explanation:
          "'Siphon Coffee'는 단수 개념이므로 'them' 대신 'it'을 사용해야 합니다. 'them'은 복수 명사를 가리킬 때 사용됩니다.",
      },
      {
        original: "I think this place is good to focus on something.",
        original_highlights: ["good to focus on something"],
        correction_highlights: ["great for focusing on something"],
        correction: "I think this place is great for focusing on something.",
        explanation:
          "'good to focus on something'보다는 'great for focusing on something'이 더 자연스러운 표현입니다. '~하는 데 좋다'는 의미에서는 'be great for ~ing' 구조가 적절합니다.",
      },
      {
        original: "Oh! They have point system and they give a lot of points.",
        original_highlights: ["point system"],
        correction_highlights: ["a point system"],
        correction:
          "Oh! They have a point system, and they give a lot of points.",
        explanation:
          "'point system'은 가산 명사이므로 'a'를 붙여 'a point system'으로 표현해야 합니다.",
      },
      {
        original:
          "The coffee bean that I had was really good, and I wanted to buy it.",
        original_highlights: ["coffee bean", "it"],
        correction_highlights: ["coffee beans", "some"],
        correction:
          "The coffee beans I had were really good, and I wanted to buy some.",
        explanation:
          "커피 원두는 일반적으로 'coffee beans'라고 복수형으로 사용됩니다. 또한, 'buy it'보다는 'buy some'이 더 자연스러운 표현입니다.",
      },
    ],
  };

  const getIndex = (
    parent: string,
    cursor: string,
  ): [number, number, string] => {
    const start = parent.indexOf(cursor);
    const end = start + cursor.length;
    return [start, end, cursor];
  };

  it("original 문장 인덱스 계산하기", () => {
    MOCK_RESPONSE.corrections.forEach((correction) => {
      const [start, end] = getIndex(MOCK_ORIGINAL, correction.original);
      const testString = MOCK_ORIGINAL.substring(start, end);
      expect(testString).toBe(correction.original);
    });
  });

  it("correction 문장 인덱스 계산하기", () => {
    MOCK_RESPONSE.corrections.forEach((correction) => {
      const [start, end] = getIndex(
        MOCK_RESPONSE.corrected_diary,
        correction.correction,
      );

      const testString = MOCK_RESPONSE.corrected_diary.substring(start, end);
      expect(testString).toBe(correction.correction);
    });
  });

  it("highlights 인덱스 계산하기", () => {
    MOCK_RESPONSE.corrections.forEach((correction) => {
      correction.correction_highlights.forEach((highlight) => {
        const [start, end] = getIndex(correction.correction, highlight);
        const testString = correction.correction.substring(start, end);
        expect(testString).toBe(highlight);
      });

      correction.original_highlights.find((highlight) => {
        const [start, end] = getIndex(correction.original, highlight);
        const testString = correction.original.substring(start, end);
        expect(testString).toBe(highlight);
      });
    });
  });
});
