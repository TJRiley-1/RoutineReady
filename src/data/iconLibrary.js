import {
  BookOpen, Pencil, Calculator, Palette, Music, FlaskConical,
  Apple, Utensils, PersonStanding, Trees, Monitor, Users,
  Sun, Moon, Home, Bus, Backpack, CircleDot, Brain, Hand,
  Star, Heart, Globe, Languages,
} from 'lucide-react'

export const iconLibrary = [
  { id: 'book', name: 'Book', icon: 'book-open', component: BookOpen },
  { id: 'pencil', name: 'Pencil', icon: 'pencil', component: Pencil },
  { id: 'calculator', name: 'Calculator', icon: 'calculator', component: Calculator },
  { id: 'palette', name: 'Art', icon: 'palette', component: Palette },
  { id: 'music', name: 'Music', icon: 'music', component: Music },
  { id: 'flask', name: 'Science', icon: 'flask-conical', component: FlaskConical },
  { id: 'apple', name: 'Snack', icon: 'apple', component: Apple },
  { id: 'utensils', name: 'Lunch', icon: 'utensils', component: Utensils },
  { id: 'running', name: 'PE/Sports', icon: 'person-standing', component: PersonStanding },
  { id: 'tree', name: 'Outdoor', icon: 'trees', component: Trees },
  { id: 'computer', name: 'Computer', icon: 'monitor', component: Monitor },
  { id: 'users', name: 'Group Work', icon: 'users', component: Users },
  { id: 'sun', name: 'Morning', icon: 'sun', component: Sun },
  { id: 'moon', name: 'Afternoon', icon: 'moon', component: Moon },
  { id: 'home', name: 'Home Time', icon: 'home', component: Home },
  { id: 'bus', name: 'Bus', icon: 'bus', component: Bus },
  { id: 'backpack', name: 'Backpack', icon: 'backpack', component: Backpack },
  { id: 'circle', name: 'Circle Time', icon: 'circle-dot', component: CircleDot },
  { id: 'brain', name: 'Thinking', icon: 'brain', component: Brain },
  { id: 'hand', name: 'Hand Raise', icon: 'hand', component: Hand },
  { id: 'star', name: 'Star/Award', icon: 'star', component: Star },
  { id: 'heart', name: 'Wellness', icon: 'heart', component: Heart },
  { id: 'globe', name: 'Geography', icon: 'globe', component: Globe },
  { id: 'language', name: 'Language', icon: 'languages', component: Languages },
]

export function getIconComponent(iconId) {
  const entry = iconLibrary.find((i) => i.id === iconId)
  return entry ? entry.component : null
}

export function getIconName(iconId) {
  const entry = iconLibrary.find((i) => i.id === iconId)
  return entry ? entry.icon : null
}
