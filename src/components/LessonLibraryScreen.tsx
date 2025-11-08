import { useState } from "react";
import {
  Search,
  Plus,
  Music,
  CheckCircle2,
  Upload,
  Filter,
  X,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface LessonLibraryScreenProps {
  onNavigate: (screen: string) => void;
  onNavigateToLesson: (lessonId: number) => void;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  status: string;
  note: string;
  category: string;
  ragam?: string;
  thalam?: string;
  difficulty?: string;
  createdDate: string;
  progress: number; // Self-assessed progress 0-100
}

export default function LessonLibraryScreen({
  onNavigate,
  onNavigateToLesson,
}: LessonLibraryScreenProps) {
  const [filter, setFilter] = useState<
    "all" | "in-progress" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<
    "date" | "ragam" | "thalam" | "difficulty"
  >("date");
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New lesson form state
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    notation: "",
    notationFile: null as File | null,
    classRecording: null as File | null,
    ragam: "",
    thalam: "",
    difficulty: "",
  });

  const lessons: Lesson[] = [
    {
      id: 1,
      title: "Varnam in Kalyani",
      description:
        "Master the fundamental varnam with focus on gamakas",
      status: "in-progress",
      note: "Focus on the higher octave transitions",
      category: "Varnam",
      ragam: "Kalyani",
      thalam: "Adi",
      difficulty: "Intermediate",
      createdDate: "2025-10-15",
      progress: 75,
    },
    {
      id: 2,
      title: "Alapana Practice",
      description: "Explore raga Bhairavi through alapana",
      status: "in-progress",
      note: "Work on slower phrases for better expression",
      category: "Alapana",
      ragam: "Bhairavi",
      thalam: "N/A",
      difficulty: "Advanced",
      createdDate: "2025-10-18",
      progress: 40,
    },
    {
      id: 3,
      title: "Kritis - Vatapi Ganapatim",
      description:
        "Learn this popular composition in Hamsadhwani",
      status: "completed",
      note: "Excellent! Ready to move to the next kriti",
      category: "Kriti",
      ragam: "Hamsadhwani",
      thalam: "Adi",
      difficulty: "Intermediate",
      createdDate: "2025-10-10",
      progress: 100,
    },
    {
      id: 4,
      title: "Bow Technique Exercises",
      description: "Daily bow control and stability drills",
      status: "in-progress",
      note: "Start with slow bowing exercises",
      category: "Technique",
      ragam: "N/A",
      thalam: "N/A",
      difficulty: "Beginner",
      createdDate: "2025-10-20",
      progress: 33,
    },
    {
      id: 5,
      title: "Thillana in Desh",
      description: "Fast-paced thillana for rhythm practice",
      status: "in-progress",
      note: "Challenge yourself with this complex rhythm",
      category: "Thillana",
      ragam: "Desh",
      thalam: "Adi",
      difficulty: "Advanced",
      createdDate: "2025-10-22",
      progress: 20,
    },
    {
      id: 6,
      title: "Raga Mohanam Scales",
      description: "Practice all three octaves",
      status: "completed",
      note: "Perfect! Great control across octaves",
      category: "Scales",
      ragam: "Mohanam",
      thalam: "N/A",
      difficulty: "Beginner",
      createdDate: "2025-10-08",
      progress: 100,
    },
  ];

  const filteredLessons = lessons
    .filter((lesson) => {
      if (filter === "in-progress")
        return lesson.status === "in-progress";
      if (filter === "completed")
        return lesson.status === "completed";
      return true;
    })
    .filter((lesson) => {
      if (!searchQuery) return true;
      return (
        lesson.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        lesson.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        lesson.ragam
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "ragam":
          return (a.ragam || "").localeCompare(b.ragam || "");
        case "thalam":
          return (a.thalam || "").localeCompare(b.thalam || "");
        case "difficulty":
          const difficultyOrder = {
            Beginner: 1,
            Intermediate: 2,
            Advanced: 3,
          };
          return (
            (difficultyOrder[
              a.difficulty as keyof typeof difficultyOrder
            ] || 0) -
            (difficultyOrder[
              b.difficulty as keyof typeof difficultyOrder
            ] || 0)
          );
        case "date":
        default:
          return (
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
          );
      }
    });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Varnam: "bg-orange-100 text-orange-700 border-orange-200",
      Alapana: "bg-blue-100 text-blue-700 border-blue-200",
      Kriti: "bg-green-100 text-green-700 border-green-200",
      Technique: "bg-[#FF901F] text-white border-[#FF901F]",
      Thillana: "bg-pink-100 text-pink-700 border-pink-200",
      Scales: "bg-teal-100 text-teal-700 border-teal-200",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: "bg-green-100 text-green-700",
      Intermediate: "bg-yellow-100 text-yellow-700",
      Advanced: "bg-red-100 text-red-700",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-700";
  };

  const handleAddLesson = () => {
    console.log("Adding lesson:", newLesson);
    setIsAddLessonOpen(false);
    // Reset form
    setNewLesson({
      title: "",
      description: "",
      notation: "",
      notationFile: null,
      classRecording: null,
      ragam: "",
      thalam: "",
      difficulty: "",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 pt-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-black dark:text-white font-bold">
              Lesson Library
            </h1>
            <Dialog
              open={isAddLessonOpen}
              onOpenChange={setIsAddLessonOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#FF901F] hover:bg-[#E67F0C] text-white">
                  <Plus size={20} className="mr-2" />
                  Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Lesson</DialogTitle>
                  <DialogDescription>
                    Create a new lesson with notation,
                    recordings, and tags
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Varnam in Shankarabharanam"
                      value={newLesson.title}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the lesson"
                      value={newLesson.description}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Notation */}
                  <div className="space-y-2">
                    <Label>Notation</Label>
                    <Textarea
                      placeholder="Type notation here (e.g., S R G M P D N S...)"
                      value={newLesson.notation}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          notation: e.target.value,
                        })
                      }
                      rows={4}
                    />
                    <div className="text-center text-sm text-gray-500 my-2">
                      OR
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#FF901F] transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,image/*"
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            notationFile:
                              e.target.files?.[0] || null,
                          })
                        }
                        className="hidden"
                        id="notation-file"
                      />
                      <label
                        htmlFor="notation-file"
                        className="cursor-pointer"
                      >
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={24}
                        />
                        <p className="text-sm text-black">
                          Upload Notation File
                        </p>
                        {newLesson.notationFile && (
                          <p className="text-sm text-green-600 mt-1">
                            ✓ {newLesson.notationFile.name}
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Recording */}
                  <div className="space-y-2">
                    <Label>Class Recording</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#FF901F] transition-colors">
                      <input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            classRecording:
                              e.target.files?.[0] || null,
                          })
                        }
                        className="hidden"
                        id="class-recording"
                      />
                      <label
                        htmlFor="class-recording"
                        className="cursor-pointer"
                      >
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />
                        <p className="text-black mb-1">
                          Upload Class Recording
                        </p>
                        {newLesson.classRecording ? (
                          <p className="text-sm text-green-600">
                            ✓ {newLesson.classRecording.name}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Audio or video file
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="border-t pt-4">
                    <h4 className="text-black mb-4">
                      <span className="font-bold">Tags</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ragam">Ragam</Label>
                        <Input
                          id="ragam"
                          placeholder="e.g., Kalyani, Bhairavi"
                          value={newLesson.ragam}
                          onChange={(e) =>
                            setNewLesson({
                              ...newLesson,
                              ragam: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="thalam">Thalam</Label>
                        <Input
                          id="thalam"
                          placeholder="e.g., Adi, Rupaka"
                          value={newLesson.thalam}
                          onChange={(e) =>
                            setNewLesson({
                              ...newLesson,
                              thalam: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">
                          Difficulty Level
                        </Label>
                        <Select
                          value={newLesson.difficulty}
                          onValueChange={(value) =>
                            setNewLesson({
                              ...newLesson,
                              difficulty: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">
                              Beginner
                            </SelectItem>
                            <SelectItem value="Intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="Advanced">
                              Advanced
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddLessonOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLesson}
                    className="flex-1 bg-[#FF901F] hover:bg-[#E67F0C] text-white"
                  >
                    Add Lesson
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Search lessons..."
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white placeholder:text-gray-400 focus:border-[#FF901F]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                onClick={() => setFilter("all")}
                variant={
                  filter === "all" ? "secondary" : "ghost"
                }
                className={`flex-shrink-0 ${filter === "all" ? "bg-[#FF901F] text-white" : "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                All Lessons
              </Button>
              <Button
                onClick={() => setFilter("in-progress")}
                variant={
                  filter === "in-progress"
                    ? "secondary"
                    : "ghost"
                }
                className={`flex-shrink-0 ${filter === "in-progress" ? "bg-[#FF901F] text-white" : "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                In Progress
              </Button>
              <Button
                onClick={() => setFilter("completed")}
                variant={
                  filter === "completed" ? "secondary" : "ghost"
                }
                className={`flex-shrink-0 ${filter === "completed" ? "bg-[#FF901F] text-white" : "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                Completed
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Sort by:
              </span>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="ragam">Ragam</SelectItem>
                  <SelectItem value="thalam">Thalam</SelectItem>
                  <SelectItem value="difficulty">
                    Difficulty
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <Music
              className="mx-auto text-gray-300 dark:text-gray-700 mb-4"
              size={64}
            />
            <p className="text-gray-600 dark:text-gray-400">No lessons found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-900 transition-all cursor-pointer"
                onClick={() => onNavigateToLesson(lesson.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          className={getCategoryColor(
                            lesson.category,
                          )}
                        >
                          {lesson.category}
                        </Badge>
                        {lesson.difficulty && (
                          <Badge
                            className={getDifficultyColor(
                              lesson.difficulty,
                            )}
                          >
                            {lesson.difficulty}
                          </Badge>
                        )}
                        {lesson.status === "completed" && (
                          <CheckCircle2
                            className="text-green-500"
                            size={18}
                          />
                        )}
                      </div>
                      <h3 className="text-black dark:text-white mb-1">
                        <span className="font-bold">
                          {lesson.title}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {lesson.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {lesson.ragam &&
                          lesson.ragam !== "N/A" && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                              🎵 {lesson.ragam}
                            </span>
                          )}
                        {lesson.thalam &&
                          lesson.thalam !== "N/A" && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              🥁 {lesson.thalam}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="bg-[#FF901F] rounded-xl p-3 flex-shrink-0">
                      <Music className="text-white" size={24} />
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 font-bold">
                        Self-Assessed Progress
                      </span>
                      <span className="text-sm text-[#FF901F] font-bold">
                        {lesson.progress}%
                      </span>
                    </div>
                    <Progress
                      value={lesson.progress}
                      className="h-2"
                    />
                  </div>

                  {/* Note */}
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="text-[#FF901F] font-bold">
                        📝 Note:
                      </span>{" "}
                      {lesson.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}