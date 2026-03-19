import { Github, Linkedin, Mail } from "lucide-react";
import rajImg from "../images/Raj.png";
import moinImg from "../images/Moin.jpeg";

const team = [
  {
    name: "Raj Kushwaha",
    id: "2024244158",
    role: "Developer & Designer",
    image: rajImg,
    github: "https://github.com/kush-raj",
    Linkedin:"www.linkedin.com/in/raj-kushwaha-382577246",
    email:"mailto:rajushwaha.work@gmail.com",
  },
  
  {
    name: "Md. Moin Khan",
    id: "2024209692",
    role: "Developer & Researcher",
    image: moinImg,
    github: "https://github.com/MOINKHAN043",
    Linkedin:"http://linkedin.com/in/md-moin-khan-84467a271",
    email:"mailto:Mdmoinkhan043@gmail.com",
  },
];

const Team = () => {
  return (
    <section id="team" className="py-24 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary font-medium mb-4 block animate-fade-up">
            OUR TEAM
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up delay-100">
            Meet the <span className="gradient-text">Developers</span>
          </h2>
          
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center max-w-3xl mx-auto">
          {team.map((member, index) => (
            <div
              key={member.id}
              className="flex-1 animate-fade-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="glass-card p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300 gradient-border">
                {/* Avatar */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden
                ring-2 ring-primary/40
                group-hover:scale-110 transition-transform duration-300">
                <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover rounded-full" />
                </div>

                <h3 className="font-display font-bold text-xl text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                

                {/* Social Links */}
                <div className="flex justify-center gap-4">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </a>
                  <a
                    href={member.Linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </a>
                  <a
                    href={member.email}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Mail className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supervisor Info */}
        <div className="max-w-2xl mx-auto mt-12 text-center animate-fade-up delay-500">
          <div className="glass-card p-6 rounded-xl inline-block">
            {/* <p className="text-muted-foreground text-sm">
             Project supervised by the{" "}
              <span className="text-foreground font-medium">
                Department of Computer Science & Application
              </span>
            </p>
            <p className="text-primary text-sm mt-1">
              Sharda School of Engineering and Technology
            </p> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
